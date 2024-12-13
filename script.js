// Show the desired section and hide others
function showSection(sectionId) {
    document.querySelectorAll("section").forEach((section) => {
        if (section.id === sectionId) {
            section.classList.remove("hidden");
        } else {
            section.classList.add("hidden");
        }
    });
}

// Example dummy data for doctor table population
const doctors = [
    { name: "Dr. John Smith", specialty: "Orthopedic Specialist", slots: ["10:00 AM", "2:00 PM"] },
    { name: "Dr. Lisa Johnson", specialty: "Sports Physiotherapist", slots: ["11:00 AM", "3:00 PM"] },
];

// Populate doctor table
function populateDoctorTable() {
    const tbody = document.querySelector("#doctorTable tbody");
    tbody.innerHTML = ""; // Clear previous content
    doctors.forEach((doctor) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${doctor.name}</td>
            <td>${doctor.specialty}</td>
            <td><button onclick="bookDoctor('${doctor.name}')">Book</button></td>
        `;
        tbody.appendChild(row);
    });
}

// Redirect to booking section with the selected doctor pre-filled
function bookDoctor(doctorName) {
    document.getElementById("doctorName").value = doctorName; // Prefill doctor name
    populateSlots(doctorName); // Populate slots for the selected doctor
    showSection("patient-booking");
}

// Populate slots dropdown based on the selected doctor
function populateSlots(doctorName) {
    const doctor = doctors.find(doc => doc.name === doctorName);
    const slotSelect = document.getElementById("slotSelect");
    slotSelect.innerHTML = '<option value="">Select Slot</option>'; // Reset slots

    if (doctor && doctor.slots) {
        doctor.slots.forEach(slot => {
            const option = document.createElement("option");
            option.value = slot;
            option.textContent = slot;
            slotSelect.appendChild(option);
        });
    }
}

// Handle admin login
document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === "admin" && password === "admin123") {
        // Show admin dashboard
        document.getElementById("loginMessage").textContent = "";
        loadAppointments(); // Load existing appointments
        showSection("admin-dashboard");
    } else {
        document.getElementById("loginMessage").textContent = "Invalid username or password!";
        document.getElementById("loginMessage").style.color = "red";
    }
});

// Logout function for admin
function logout() {
    showSection("home");

    // Add logout success message
    const messageDiv = document.createElement("div");
    messageDiv.textContent = "You have successfully logged out.";
    messageDiv.style.color = "green";
    messageDiv.style.textAlign = "center";
    messageDiv.style.marginTop = "20px";
    messageDiv.style.fontWeight = "bold";

    const homeSection = document.getElementById("home");
    homeSection.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Handle appointment booking
document.getElementById("appointmentForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const appointment = {
        patientName: document.getElementById("name").value,
        email: document.getElementById("email").value,
        contact: document.getElementById("contact").value,
        reason: document.getElementById("reason").value,
        doctor: document.getElementById("doctorName").value, // Use prefilled doctor name
        date: document.getElementById("date").value,
        slot: document.getElementById("slotSelect").value,
    };

    try {
        const response = await fetch("http://localhost:3000/appointments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(appointment),
        });

        const result = await response.json();

        const messageDiv = document.getElementById("message");
        if (response.ok) {
            messageDiv.textContent = "Appointment booked successfully!";
            messageDiv.style.color = "green";
            e.target.reset();

            setTimeout(() => {
                messageDiv.textContent = "";
            }, 3000);
        } else {
            messageDiv.textContent = "Failed to book appointment. Please try again.";
            messageDiv.style.color = "red";
        }
    } catch (error) {
        console.error("Error:", error);

        const messageDiv = document.getElementById("message");
        messageDiv.textContent = "An error occurred while booking the appointment.";
        messageDiv.style.color = "red";
    }
});

// Load appointments into the admin dashboard
async function loadAppointments() {
    try {
        const response = await fetch("http://localhost:3000/appointments");
        const appointments = await response.json();

        const tbody = document.querySelector("#appointmentsTable tbody");
        tbody.innerHTML = ""; // Clear previous content

        appointments.forEach((appt, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${appt.patientName}</td>
                <td>${appt.email}</td>
                <td>${appt.contact}</td>
                <td>${appt.reason}</td>
                <td>${appt.doctor}</td>
                <td>${appt.date}</td>
                <td>${appt.slot}</td>
                <td><button onclick="deleteAppointment(${index})">Delete</button></td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading appointments:", error);
    }
}

// Delete an appointment
async function deleteAppointment(appointmentId) {
    try {
        const response = await fetch(`http://localhost:3000/appointments/${appointmentId}`, {
            method: "DELETE",
        });

        if (response.ok) {
            alert("Appointment deleted successfully!");
            loadAppointments(); // Refresh appointments
        } else {
            const result = await response.json();
            alert(`Failed to delete appointment: ${result.message}`);
        }
    } catch (error) {
        console.error("Error deleting appointment:", error);
        alert("An error occurred while deleting the appointment.");
    }
}


// Initialize the app on page load
document.addEventListener("DOMContentLoaded", () => {
    populateDoctorTable();
});


