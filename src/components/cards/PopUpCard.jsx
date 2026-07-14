import React, { useContext, useState } from "react";
import logo from '../../assets/Penta.png'
import PentaContext from "../../context/PentaContext";

const PopUpCard = ({ showModal, setShowModal }) => {
    const { message } = useContext(PentaContext)

    return (
        <>
            <div className= {showModal ? "modal is-active" : "modal"}>
                <div className="modal-background" onClick={() => setShowModal(false)}></div>
                <div 
                    className="modal-card has-text-centered"
                    style={{ borderRadius: 20, width: "50%", overflow: "hidden" }}
                >
                    <header
                        className="has-background-light"
                        style={{
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "1rem 1.25rem",
                            borderBottom: "1px solid #dbdbdb",
                        }}
                    >
                        <p className="modal-card-title" style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#363636" }}>Please note</p>
                        <button
                            className="delete is-medium"
                            aria-label="close"
                            onClick={() => setShowModal(false)}
                            style={{ position: "absolute", right: "1.25rem", backgroundColor: "#c4c4c4", borderRadius: "9999px" }}
                        ></button>
                    </header>
                    <div style={{ display: "flex", alignItems: "stretch" }}>
                        <div
                            className="has-background-white"
                            style={{
                                flex: "0 0 50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <img
                                src={logo}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                }}
                            />
                        </div>
                        <div
                            className="has-background-light"
                            style={{
                                flex: "1 1 50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <article style={{ padding: 20 }}>{message}</article>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PopUpCard;