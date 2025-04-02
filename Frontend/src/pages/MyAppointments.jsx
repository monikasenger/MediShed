import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const MyAppointments = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);

  const months = [" ", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const slotDateFormat = (slotDate) => {
    const datearray = slotDate.split("_");
    return datearray[0] + " " + months[Number(datearray[1])] + " " + datearray[2];
  };

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/appointments`, { headers: { token } });
      if (data.success) {
        setAppointments(data.appointments.reverse());
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const markAsPaid = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/mark-paid`,
        { appointmentId },
        { headers: { token } }
      );

      if (data.success) {
        toast.success("Payment Successful");
        getUserAppointments(); // Fetch updated appointments
      } else {
        toast.error("Failed to mark as paid");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/cancel-appointment`,
        { appointmentId },
        { headers: { token } }
      );

      if (data.success) {
        toast.success("Appointment Cancelled");
        setAppointments(appointments.map(item => 
          item._id === appointmentId ? { ...item, cancelled: true } : item
        ));
      } else {
        toast.error("Failed to cancel appointment");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token]);

  return (
    <div className="max-w-5xl mx-auto mt-8 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6">My Appointments</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {appointments.map((item, index) => (
          <div key={index} className="p-4 border rounded-lg shadow-sm flex flex-col items-center sm:items-start">
            <div className="w-24 h-24 mb-4">
              <img src={item.docData.image} alt={item.name} className="w-full h-full rounded-lg object-cover" />
            </div>
            <div className="text-center sm:text-left w-full">
              <p className="text-lg font-semibold">{item.docData.name}</p>
              <p className="text-sm text-gray-600">{item.docData.speciality}</p>
              <p className="text-sm text-black">Address:-</p>
              <p className="text-sm text-gray-600">{item.docData.address.line1}</p>
              <p className="text-sm text-gray-600">{item.docData.address.line2}</p>
              <p className="text-sm text-blue-600 font-medium">
                <span className="font-semibold">Date & Time:</span> {slotDateFormat(item.slotDate)} | {item.slotTime}
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full mt-4">
              {/* If appointment is paid, show Paid button */}
              {!item.cancelled && item.payment  && (
                <button className="sm:min-w-48 py-2 border rounded border-blue-500 text-blue-500 bg-blue-100">
                 Online Paid
                </button>
              )}
              {/* If appointment is not paid, show Pay Online button */}
              {!item.cancelled && !item.payment && !item.isCompleted && (
                <button
                  onClick={() => markAsPaid(item._id)} // Call markAsPaid on click
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full"
                >
                  Pay Online
                </button>
              )}
              {/* If appointment is not cancelled or completed, show Cancel Appointment button */}
              {!item.cancelled && !item.isCompleted && !item.payment && (
                <button 
                  onClick={() => cancelAppointment(item._id)} // Call cancelAppointment on click
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700 w-full"
                >
                  Cancel Appointment
                </button>
              )}
              {/* If appointment is cancelled */}
              {item.cancelled && (
                <button className="sm:min-w-48 border border-red-500 text-red-500 bg-red-100 px-4 py-2 rounded">
                  Appointment Cancelled
                </button>
              )}
              {/* If appointment is completed */}
              {item.isCompleted && !item.payment && (
                <button className="sm:min-w-48 py-2 border border-green-500 rounded text-green-500 bg-green-100">
                  Completed
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppointments;
