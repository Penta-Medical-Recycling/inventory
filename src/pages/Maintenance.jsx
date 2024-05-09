import React from "react"
import logo from "../assets/PentaLogo.png"

function Maintenance ({ message }) {
    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <img
                src= {logo}
                alt="Company Logo"
                style={{ width: '200px', marginBottom: '20px' }}
            />
            <p>{ message }</p>
        </div>
    )
}

export default Maintenance