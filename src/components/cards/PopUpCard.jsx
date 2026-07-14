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
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "1rem 1.25rem",
                            borderBottom: "1px solid #dbdbdb",
                        }}
                    >
                        <p className="modal-card-title" style={{ margin: 0 }}>Please note</p>
                        <button className="delete" aria-label="close" onClick={() => setShowModal(false)}></button>
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