const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const APPOINTMENTS_FILE = path.join(__dirname, 'appointments.json');

// Read existing appointments
async function readAppointments() {
    try {
        const data = await fs.readFile(APPOINTMENTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading appointments file:', error);
        return [];
    }
}

// Write appointments
async function writeAppointments(appointments) {
    try {
        await fs.writeFile(APPOINTMENTS_FILE, JSON.stringify(appointments, null, 2));
    } catch (error) {
        console.error('Error writing appointments file:', error);
    }
}

// Book appointment endpoint
app.post('/appointments', async (req, res) => {
    try {
        const newAppointment = {
            id: Date.now().toString(),
            ...req.body
        };

        const appointments = await readAppointments();
        appointments.push(newAppointment);
        await writeAppointments(appointments);

        res.status(201).json({
            message: 'Appointment booked successfully',
            appointment: newAppointment
        });
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({ message: 'Error booking appointment' });
    }
});

// Get all appointments
app.get('/appointments', async (req, res) => {
    try {
        const appointments = await readAppointments();
        res.json(appointments);
    } catch (error) {
        console.error('Error retrieving appointments:', error);
        res.status(500).json({ message: 'Error retrieving appointments' });
    }
});

// Delete an appointment by ID
app.delete('/appointments/:id', async (req, res) => {
    try {
        const appointmentId = req.params.id;
        console.log('Received DELETE request for ID:', appointmentId);

        const appointments = await readAppointments();
        console.log('Existing appointments:', appointments);

        // Filter out the appointment with the matching ID
        const updatedAppointments = appointments.filter(appt => appt.id !== appointmentId);

        if (appointments.length === updatedAppointments.length) {
            console.log('Appointment not found for ID:', appointmentId);
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Save the updated appointments to the file
        await writeAppointments(updatedAppointments);
        console.log('Updated appointments:', updatedAppointments);

        res.status(200).json({ message: 'Appointment deleted successfully!' });
    } catch (error) {
        console.error('Error deleting appointment:', error);
        res.status(500).json({ message: 'Error deleting appointment' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
