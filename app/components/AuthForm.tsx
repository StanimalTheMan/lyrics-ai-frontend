"use client"
import React, { useState } from "react"

type Props = {
  onAuthSuccess: (token: string) => void
}

export default function AuthForm({ onAuthSuccess }: Props) {
  const [isRegister, setIsRegister] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    const endpoint = isRegister
      ? "http://lyrics-ai-backend-production.up.railway.app:8080/api/auth/register"
      : "http://lyrics-ai-backend-production.up.railway.app:8080/api/auth/login"
    try {
      const payload = isRegister
        ? { firstName, lastName, email, password }
        : { email, password }
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(await res.text())
      if (isRegister) {
        setIsRegister(false)
        setSuccess("Registration successful!  Please sign in.")
        return
      }
      const data = await res.json()
      if (data.token) {
        onAuthSuccess(data.token)
      } else {
        setError("No token received")
      }
    } catch (err: any) {
      setError(err.message || "Error")
    }
  }

  return (
    <div>
      <h2>{isRegister ? "Register" : "Sign In"}</h2>
      <form onSubmit={handleSubmit}>
        {isRegister && (
          <>
            <input
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <br />
            <input
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
            <br />
          </>
        )}
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <button type="submit">{isRegister ? "Register" : "Sign In"}</button>
      </form>
      <button
        onClick={() => {
          setIsRegister((isRegister) => !isRegister)
          setError("")
          setSuccess("")
        }}
      >
        {isRegister ? "Have an account? Sign In" : "No account? Register"}
      </button>
      {success && <div style={{ color: "green" }}>{success}</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  )
}
