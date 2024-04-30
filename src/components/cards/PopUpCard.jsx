import React, { useContext, useState } from "react";
import logo from '../../assets/Penta.png'
import PentaContext from "../../context/PentaContext";

const PopUpCard = () => {
    const { showModal, setShowModal } = useContext(PentaContext)
    const [message, setMessage] = useState("")

    const toggleModal = () => {
        setShowModal(!setShowModal)
    }
    
    //fetching message for pop-up
    //changeGP
    const apiKey = "patEd00q4REEnaMAs.893047f939ee5d324f5c26d1b5cb4491e1ec6e86ce78ce2cf604b47f0cb98631";
    const apiUrl = "https://api.airtable.com/v0/appZM47xckWRqZ8RH/Site-Status";
    fetch(apiUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "authorization": `Bearer ${apiKey}`
        }
    }).then(response => response.json()).then(msg => setMessage(msg.records[0].fields.Message))


    return (
        <>
            <div className="modal is-active">
                <div className="modal-background"></div>
                <div 
                    className="modal-card has-text-centered"
                    style={{ borderRadius: 20, width: 800}}
                >
                    <div className="columns">
                        <div className="column has-background-white">
                            <figure className="image is-square">
                                <img src={logo} />
                            </figure>
                        </div>
                        <div className="column has-background-light">
                            <header class="modal-card-head">
                                <p class="modal-card-title">Message</p>
                                <button class="delete" aria-label="close" onClick={() => setShowModal(false)}></button>
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