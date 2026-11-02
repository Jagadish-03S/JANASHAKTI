export const DAVANAGERE_WARDS = Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  name: `Ward ${i + 1} - ${[
    'Nittuvalli', 'MCC A Block', 'MCC B Block', 'Vidyanagar', 'Hadadi Road',
    'PJ Extension', 'KTJ Nagar', 'Mandipet', 'Shabanur', 'Avaragere',
    'SS Layout', 'Kuvempu Nagar', 'Saraswathi Nagar', 'Vinobha Nagar', 'Anjaneya Badavane',
    'Jayanagar', 'Sitaram Nagar', 'Nituvalli Rural', 'Bada Cross', 'Channagiri Road',
    'Harihar Road', 'Kadur Road', 'Gandhi Circle', 'Clock Tower', 'Doddapete',
    'Old Town', 'Azad Nagar', 'Basha Nagar', 'Tibetan Colony Area', 'Shiramgondanahalli',
    'Hemavathi Layout', 'Basavanagudi', 'Maratha Galli', 'Chigateri Hospital Zone', 'Davanagere Fort Area',
    'Devaraj Urs Layout', 'Industrial Area', 'Kalyan Nagar', 'Lal Bahadur Nagar', 'Netaji Circle',
    'Ashok Nagar', 'Prashanth Nagar', 'Rajarajeswari Nagar', 'Venkateshwara Layout', 'Kote Area'
  ][i % 45]}`,
}));

export const EMERGENCY_CONTACTS = [
  { name: 'Karnataka Unified Emergency', number: '112', type: 'Emergency' },
  { name: 'Davanagere City Police Control', number: '08192-250100', type: 'Police' },
  { name: 'MCC Mahanagara Palike Toll-Free', number: '08192-250101', type: 'Municipal' },
  { name: 'BESCOM Electricity Helpline', number: '1912', type: 'Electricity' },
  { name: 'Chigateri District Hospital', number: '08192-231222', type: 'Health' },
  { name: 'Fire & Rescue Davanagere', number: '101', type: 'Fire' },
];

