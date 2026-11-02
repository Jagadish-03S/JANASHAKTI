const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const env = require('../config/env');
const { memoryStore } = require('../config/db');
const { ROLES } = require('../config/constants');
const { sanitizeUserProfile } = require('../utils/privacyMasker');

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

// Validation helpers
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(\+91)?[6-9]\d{9}$/;

async function register(req, res) {
  const { fullName, email, phoneNumber, password, role = ROLES.CITIZEN } = req.body;

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Full name is required and must be at least 2 characters.',
    });
  }

  if (!email || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'A valid email address is required.',
    });
  }

  if (phoneNumber && !PHONE_REGEX.test(phoneNumber.trim().replace(/\s+/g, ''))) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid Indian mobile number (+91 or 10 digits starting 6-9).',
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long.',
    });
  }

  // Prevent self-registration as Authority or Admin without administrative onboarding
  const assignedRole = (role === ROLES.VOLUNTEER) ? ROLES.VOLUNTEER : ROLES.CITIZEN;

  const cleanEmail = email.toLowerCase().trim();
  const cleanPhone = phoneNumber ? phoneNumber.trim().replace(/\s+/g, '') : null;

  const existingUser = memoryStore.users.find(
    u => u.email.toLowerCase() === cleanEmail || (cleanPhone && u.phone_number === cleanPhone)
  );

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'An account with this email address or phone number is already registered.',
    });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser = {
    id: `usr-${uuidv4().substring(0, 8)}`,
    full_name: fullName.trim(),
    email: cleanEmail,
    phone_number: cleanPhone,
    password_hash: passwordHash,
    role: assignedRole,
    is_verified: true,
    created_at: new Date(),
  };

  memoryStore.users.push(newUser);

  // Record audit entry
  memoryStore.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    action: 'USER_REGISTER',
    resource_type: 'USER',
    resource_id: newUser.id,
    actor_id: newUser.id,
    actor_name: newUser.full_name,
    actor_role: newUser.role,
    remarks: `New ${assignedRole} registered via Davanagere Civic Portal`,
    created_at: new Date(),
  });

  const token = generateToken(newUser);

  res.status(201).json({
    success: true,
    message: `Account created successfully as ${assignedRole} for Davanagere Civic Portal.`,
    token,
    user: sanitizeUserProfile(newUser),
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required.',
    });
  }

  const cleanEmail = email.toLowerCase().trim();
  const user = memoryStore.users.find(u => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email address or password.',
    });
  }

  // Verify password with bcrypt (or demo bypass for instant testing)
  let isMatch = false;
  if (user.password_hash) {
    isMatch = await bcrypt.compare(password, user.password_hash);
  }
  if (!isMatch && password === 'Password@123') {
    isMatch = true;
  }

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email address or password.',
    });
  }

  const token = generateToken(user);

  // Record login audit
  memoryStore.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    action: 'USER_LOGIN',
    resource_type: 'USER',
    resource_id: user.id,
    actor_id: user.id,
    actor_name: user.full_name,
    actor_role: user.role,
    remarks: 'Successful user authentication',
    created_at: new Date(),
  });

  res.status(200).json({
    success: true,
    message: 'Authentication successful.',
    token,
    user: sanitizeUserProfile(user),
  });
}

function getMe(req, res) {
  const user = memoryStore.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User profile not found.' });
  }

  res.status(200).json({
    success: true,
    user: sanitizeUserProfile(user),
  });
}

function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid registered email address.' });
  }

  const user = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  // Always return success message for security (prevent email enumeration)
  res.status(200).json({
    success: true,
    message: 'If an account exists with this email, a 6-digit verification OTP has been dispatched.',
    pilotHint: user ? 'Demo OTP code is: 123456' : null,
  });
}

function resetPassword(req, res) {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Email, OTP (123456), and valid new password (min 6 chars) are required.' });
  }

  if (otp !== '123456') {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP code.' });
  }

  const user = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) {
    return res.status(404).json({ success: false, message: 'No registered user matches this email.' });
  }

  // Update password in memory
  const salt = bcrypt.genSaltSync(10);
  user.password_hash = bcrypt.hashSync(newPassword, salt);

  res.status(200).json({
    success: true,
    message: 'Password reset successful. You may now sign in with your new credentials.',
  });
}

function getDemoAccounts(req, res) {
  const demoProfiles = [
    {
      role: ROLES.CITIZEN,
      email: 'ramesh.cit@example.com',
      password: 'Password@123',
      name: 'Ramesh Kumar (Citizen)',
      description: 'Reports local road and water hazards around Davanagere.',
    },
    {
      role: ROLES.VOLUNTEER,
      email: 'priya.vol@example.com',
      password: 'Password@123',
      name: 'Priya Sharma (Volunteer)',
      description: 'Community volunteer vouching for nearby incidents.',
    },
    {
      role: ROLES.AUTHORITY,
      email: 'officer@mcc.gov.in',
      password: 'Password@123',
      name: 'MCC Ward Control Officer',
      description: 'Official municipal engineer assigning work and verifying reports.',
    },
    {
      role: ROLES.ADMIN,
      email: 'admin@janashakti.gov.in',
      password: 'Password@123',
      name: 'Davanagere System Admin',
      description: 'Full platform administration, audit logs, and department controls.',
    },
  ];

  res.status(200).json({
    success: true,
    demoAccounts: demoProfiles,
  });
}

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  getDemoAccounts,
};
