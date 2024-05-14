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
                    style={{ borderRadius: 20, width: "50%" }}
                >
                    <div className="columns">
                        <div className="column has-background-white">
                            <figure className="image is-square">
                                <img src={logo} />
                            </figure>
                        </div>
                        <div className="column has-background-light">
                            <header className="modal-card-head">
                                <p className="modal-card-title">Please note</p>
                                <button className="delete" aria-label="close" onClick={() => setShowModal(false)}></button>
                            </header>
                            <article style={{ padding: 20 }}>{message}</article>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PopUpCard;