// ================================================================
// CREATE: frontend/src/pages/auth/MemberRegister.js
// ================================================================
// Public registration page for members
// ================================================================

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Input, Button, Card } from "../../components/ui/UI";
import { MdPerson, MdEmail, MdLock, MdPhone, MdBusiness } from "react-icons/md";
import toast from "react-hot-toast";
import "./Auth.css";

export default function MemberRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    groupId: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    career: "",
    maritalStatus: "",
    occupation: "",
    stateOfOrigin: "",
    localGovernment: "",
    countryOfResidence: "",
    residentialAddress: "",
    nextOfKinName: "",
    nextOfKinPhone: "",
    nextOfKinRelationship: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.groupId ||
      !formData.name ||
      !formData.email ||
      !formData.password
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const API_URL =
        process.env.REACT_APP_API_URL ||
        "https://backend-083k.onrender.com/api";

      const response = await axios.post(`${API_URL}/members/self-register`, {
        groupId: formData.groupId,
        name: formData.name,
        email: formData.email.toLowerCase(),
        phone: formData.phone,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth,
        career: formData.career,
        maritalStatus: formData.maritalStatus,
        occupation: formData.occupation,
        stateOfOrigin: formData.stateOfOrigin,
        localGovernment: formData.localGovernment,
        countryOfResidence: formData.countryOfResidence,
        residentialAddress: formData.residentialAddress,
        nextOfKin: JSON.stringify({
          name: formData.nextOfKinName,
          phone: formData.nextOfKinPhone,
          relationship: formData.nextOfKinRelationship,
        }),
      });

      toast.success(
        response.data.message || "Registration successful! Awaiting approval.",
      );

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/member-login");
      }, 2000);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Registration failed. Please try again.",
      );
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Card className="auth-card auth-card--wide">
          <div className="auth-header">
            <h1 className="auth-title">Member Registration</h1>
            <p className="auth-subtitle">
              Join your association by filling in the details below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Group ID */}
            <div className="auth-section">
              <h3 className="auth-section-title">Association Information</h3>
              <Input
                label="Association Group ID *"
                name="groupId"
                value={formData.groupId}
                onChange={handleChange}
                icon={<MdBusiness />}
                placeholder="Enter your association's Group ID"
                required
              />
              <p className="auth-hint">
                Contact your association administrator to get the Group ID
              </p>
            </div>

            {/* Personal Information */}
            <div className="auth-section">
              <h3 className="auth-section-title">Personal Information</h3>
              <Input
                label="Full Name *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                icon={<MdPerson />}
                placeholder="Kelvin Derek"
                required
              />
              <Input
                label="Email Address *"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                icon={<MdEmail />}
                placeholder="derek@example.com"
                required
              />
              <Input
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                icon={<MdPhone />}
                placeholder="+234 804444566"
              />
              <Input
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
              <Input
                label="Career/Profession"
                name="career"
                value={formData.career}
                onChange={handleChange}
                placeholder="e.g., Doctor"
              />
            </div>

            {/* Account Security */}
            <div className="auth-section">
              <h3 className="auth-section-title">Account Security</h3>
              <Input
                label="Password *"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                icon={<MdLock />}
                placeholder="Min. 6 characters"
                required
              />
              <Input
                label="Confirm Password *"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                icon={<MdLock />}
                placeholder="Re-enter password"
                required
              />
            </div>

            {/* Additional Information (Optional) */}
            <div className="auth-section">
              <h3 className="auth-section-title">
                Additional Information (Optional)
              </h3>

              <div className="auth-form-row">
                <div className="auth-form-col">
                  <label className="auth-label">Marital Status</label>
                  <select
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleChange}
                    className="auth-select"
                  >
                    <option value="">Select</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                </div>
                <div className="auth-form-col">
                  <Input
                    label="Occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="auth-form-row">
                <div className="auth-form-col">
                  <Input
                    label="State of Origin"
                    name="stateOfOrigin"
                    value={formData.stateOfOrigin}
                    onChange={handleChange}
                  />
                </div>
                <div className="auth-form-col">
                  <Input
                    label="Local Government"
                    name="localGovernment"
                    value={formData.localGovernment}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <Input
                label="Country of Residence"
                name="countryOfResidence"
                value={formData.countryOfResidence}
                onChange={handleChange}
              />

              <div className="auth-form-group">
                <label className="auth-label">Residential Address</label>
                <textarea
                  name="residentialAddress"
                  value={formData.residentialAddress}
                  onChange={handleChange}
                  rows={3}
                  className="auth-textarea"
                  placeholder="Enter your full address"
                />
              </div>
            </div>

            {/* Next of Kin */}
            <div className="auth-section">
              <h3 className="auth-section-title">Next of Kin (Optional)</h3>
              <Input
                label="Name"
                name="nextOfKinName"
                value={formData.nextOfKinName}
                onChange={handleChange}
              />
              <Input
                label="Phone Number"
                name="nextOfKinPhone"
                value={formData.nextOfKinPhone}
                onChange={handleChange}
              />
              <Input
                label="Relationship"
                name="nextOfKinRelationship"
                value={formData.nextOfKinRelationship}
                onChange={handleChange}
                placeholder="e.g., Spouse, Parent, Sibling"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
              className="auth-button"
            >
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>

          <div className="auth-footer">
            <p>Already have an account?</p>
            <Link to="/member-login" className="auth-link">
              Login here
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
