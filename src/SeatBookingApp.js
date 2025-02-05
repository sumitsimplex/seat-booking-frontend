import React, { useState, useEffect } from "react";
import axios from "axios";

const SeatBookingApp = () => {
  const [desks, setDesks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDesk, setSelectedDesk] = useState(null);
  const [employeeName, setEmployeeName] = useState("");
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);  // Modal for booking
  const [showCancelModal, setShowCancelModal] = useState(false);  // Modal for canceling booking

  useEffect(() => {
    fetchDesks();
  }, []);

  const fetchDesks = async () => {
    try {
      const response = await axios.get("http://localhost:5000/desks");
      setDesks(response.data);
    } catch (error) {
      console.error("Error fetching desks:", error);
    }
  };

  const getWeekDates = () => {
    const today = new Date();
    const monday = new Date(today.setDate(today.getDate() - today.getDay() + 1));

    let dates = [];
    for (let i = 0; i < 10; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push({
          date: date.toISOString().split("T")[0],
          weekday: date.toLocaleString("en-US", { weekday: "long" }),
        });
      }
    }
    return dates;
  };

  const handleDeskClick = (desk, date) => {
    const booking = desk.bookings[date] || { isAvailable: true, employee_name: "" };

    if (!booking.isAvailable) {
      setSelectedDesk(desk);
      setSelectedDate(date);
      setShowCancelModal(true);  // Show cancel booking modal if desk is booked
    } else {
      setSelectedDesk(desk);
      setSelectedDate(date);
      setShowBookingModal(true);  // Show booking modal if desk is available
    }
  };

  const submitBooking = async () => {
    if (!employeeName) {
      alert("Please enter your name.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/desks/book", {
        id: selectedDesk.id,
        employee_name: employeeName,
        date: selectedDate,
      });
      fetchDesks();
      setSelectedDesk(null);
      setEmployeeName("");
      setShowBookingModal(false);  // Hide modal after successful booking
    } catch (error) {
      console.error("Error booking desk:", error);
    }
  };

  const confirmCancelBooking = async () => {
    try {
      await axios.delete(`http://localhost:5000/desks/${selectedDesk.id}`, {
        data: { date: selectedDate },
      });
      fetchDesks();
      setSelectedDesk(null);
      setShowCancelModal(false);  // Hide modal after canceling booking
    } catch (error) {
      console.error("Error cancelling booking:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      {/* Title with Image Background */}
      <div
        style={{
          position: "relative",
          width: "600px",
          height: "300px",
          margin: "0 auto",
          backgroundImage: "url('/desk.webp')", // Path to your image
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "8px",
        }}
      >
        {/* Darker Overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)", // Semi-transparent black overlay
            borderRadius: "8px",
          }}
        ></div>

        {/* Title Text */}
        <h1
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "2rem",
            fontWeight: "bold",
            color: "#fff",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
          }}
        >
          DAI - Seat Booking App
        </h1>
        {/* New Image beside title */}
        <img
          src="/img.png" // Path to your new image
          alt="Additional Image"
          style={{
            position: "absolute",
            top: "50%",
            right: "10px", // Distance from the right side of the container
            transform: "translateY(-50%)", // Vertically center the image
            width: "24%", // Reduce the size to 3 times smaller (from original 955px to approx 318px)
            height: "auto", // Maintain the aspect ratio
            borderRadius: "8px", // Optional: round the corners of the image
          }}
        />
      </div>

      {getWeekDates().map(({ date, weekday }) => (
        <div key={date} style={{ marginBottom: "20px" }}>
          <h3>{`${weekday}, ${date}`}</h3>
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
            {desks.map((desk) => {
              const booking = desk.bookings[date] || { isAvailable: true, employee_name: "" };
              return (
                <button
                  key={desk.id}
                  onClick={() => handleDeskClick(desk, date)}
                  style={{
                    backgroundColor: booking.isAvailable ? "green" : "red",
                    color: "white",
                    padding: "15px 30px",
                    border: "none",
                    cursor: "pointer",
                    width: "100%",  // Make buttons take full width on smaller screens
                    maxWidth: "150px",  // Limit max width
                    fontSize: "1rem",
                    borderRadius: "8px",
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    margin: "5px",  // Add some space between buttons
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "scale(1.05)";
                    e.target.style.boxShadow = "0px 6px 8px rgba(0, 0, 0, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "scale(1)";
                    e.target.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";
                  }}
                >
                  <i className="fas fa-desktop" style={{ marginRight: "10px" }}></i>
                  {booking.isAvailable ? desk.name : booking.employee_name}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Modal for Booking */}
      {showBookingModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark overlay
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000, // Ensure modal is on top
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "30px",
              borderRadius: "8px",
              boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.2)",
              width: "400px",
              maxWidth: "100%",
            }}
          >
            <h3>{selectedDesk && selectedDesk.name}</h3>
            <h4>{selectedDate}</h4>
            <input
              type="text"
              placeholder="Enter your name"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              style={{
                padding: "8px",
                marginRight: "10px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                fontSize: "1rem",
                width: "100%",
              }}
            />
            <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={submitBooking}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "green",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                Confirm Booking
              </button>
              <button
                onClick={() => setShowBookingModal(false)} // Close the modal
                style={{
                  padding: "10px 20px",
                  backgroundColor: "grey",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Cancel Booking */}
      {showCancelModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "30px",
              borderRadius: "8px",
              boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.2)",
              width: "400px",
              maxWidth: "100%",
            }}
          >
            <h3>{selectedDesk && selectedDesk.name}</h3>
            <h4>{selectedDate}</h4>
            <p>
              Are you sure you want to cancel the booking for this desk?
            </p>
            <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={confirmCancelBooking}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "red",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                Confirm Cancellation
              </button>
              <button
                onClick={() => setShowCancelModal(false)} // Close the modal
                style={{
                  padding: "10px 20px",
                  backgroundColor: "grey",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatBookingApp;
