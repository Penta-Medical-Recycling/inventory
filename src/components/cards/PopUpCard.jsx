import React, { useContext } from "react";
import logo from '../../assets/Penta.png'
import PentaContext from "../../context/PentaContext";

const PopUpCard = () => {
    const { showModal, setShowModal } = useContext(PentaContext)

    const toggleModal = () => {
        setShowModal(!setShowModal)
    }
    
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
                        <article> This is a test</article>
                    </div>
                </div>
            </div>
            <button class="modal-close is-large" aria-label="close" onClick={() => setShowModal(false)}></button>
            </div>
        </>
    )
}

export default PopUpCard;