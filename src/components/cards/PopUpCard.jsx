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
    const apiKey = "patn9gZ37SyMZFlpA.a905836b6861c9e07e7672e4a35d021f62fd188a5e6a179e012039f1548f0c1c";
    const apiUrl = "https://api.airtable.com/v0/appVq0I1h8SzD5K39/tblAmKhDQR8YxQeqG";
    fetch(apiUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "authorization": `Bearer ${apiKey}`
        }
    }).then(response => response.json()).then(msg => setMessage(msg.records[0].fields.Message))


    return (
        <>
            <div class="modal is-active">
            <div class="modal-background"></div>
            <div class="modal-content has-text-centered ">
                <div class="columns">
                    <div class="column has-background-white">
                        <figure class="image is-square">
                            <img src={logo} />
                        </figure>
                    </div>
                    <div class="column has-background-light">
                        <article>{message}</article>
                    </div>
                </div>
            </div>
            <button class="modal-close is-large" aria-label="close" onClick={() => setShowModal(false)}></button>
            </div>
        </>
    )
}

export default PopUpCard;