import React from "react"
import logo from "../assets/PentaLogo.png"

function Maintenance () {
    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <img
                src= {logo}
                alt="Company Logo"
                style={{ width: '200px', marginBottom: '20px' }}
            />
            <h2>Server Maintenance</h2>
            <p>Please check back later.</p>
        </div>
    )
}

export default Maintenance