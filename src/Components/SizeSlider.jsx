// components/PriceRangeSlider.js

import { useState } from 'react';

const SizeSlider = ({
    minValue,
    setMinValue,
    maxValue,
    setMaxValue,
    isOn,
    setIsOn,
    largestSize }) => {
    // const [minValue, setMinValue] = useState(5);
    // const [maxValue, setMaxValue] = useState(15);
    // const [isOn, setIsOn] = useState(false);

    const toggleSwitch = () => {
        setIsOn(prevState => !prevState);
    };

    const handleMinChange = (event) => {
        const newMinValue = parseInt(event.target.value);
        if (newMinValue <= maxValue && newMinValue >= 1) {
            setMinValue(newMinValue);
        }
    };

    const handleMaxChange = (event) => {
        const newMaxValue = parseInt(event.target.value);
        if (newMaxValue >= minValue && newMaxValue <= largestSize) {
            setMaxValue(newMaxValue);
        }
    };

    const handleMinSliderChange = (event) => {
        const newMinValue = parseInt(event.target.value);
        if (newMinValue <= maxValue && newMinValue >= 1) {
            setMinValue(newMinValue);
        }
    };

    const handleMaxSliderChange = (event) => {
        const newMaxValue = parseInt(event.target.value);
        if (newMaxValue >= minValue && newMaxValue <= largestSize) {
            setMaxValue(newMaxValue);
        }
    };

    return (
        <div className="wrapper">
            <header>
                <div className='is-flex is-align-items-center is-justify-content-space-between'>
                    <h2>Size Range</h2>
                    <div className={`switch ${isOn ? 'on' : 'off'}`} onClick={toggleSwitch}>
                        <div className="circle" />
                    </div>
                </div>
                <p>Use slider to enter min and max size</p>
            </header>
            <div className={isOn ? "size-input" : "size-off size-input"}>
                <div className="field">
                    <input
                        type="number"
                        className="input-min slider-input" // Specific class added
                        value={minValue}
                        onChange={handleMinChange}
                        min="1"
                        max={maxValue} // Added max attribute
                    // style={{height: '100%'}}
                    />
                    <div className='is-flex is-justify-content-space-evenly' style={{ userSelect: 'none', width: '100%', cursor: 'pointer' }}>
                        <div className='crease-click' onClick={() => {
                            if (minValue > 1) setMinValue(minValue - 1)
                        }}>
                            <p>-</p>
                        </div>
                        <div className='crease-click' onClick={() => {
                            if (minValue < maxValue) setMinValue(minValue + 1)
                        }}>
                            <p>+</p>
                        </div>
                    </div>
                </div>
                <div className="separator">⇄</div>
                <div className="field">
                    <input
                        type="number"
                        className="input-max slider-input" // Specific class added
                        value={maxValue}
                        onChange={handleMaxChange}
                        min="1"
                        max={maxValue} // Added max attribute
                    />
                    <div className='is-flex is-justify-content-space-evenly' style={{ userSelect: 'none', width: '100%', cursor: 'pointer' }}>
                        <div className='crease-click' onClick={() => {
                            if (maxValue > minValue) setMaxValue(maxValue - 1)
                        }}>
                            <p>-</p>
                        </div>
                        <div className='crease-click' onClick={() => {
                            if (maxValue < largestSize) setMaxValue(maxValue + 1)
                        }}>
                            <p>+</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className={isOn ? "slider" : "size-off slider"}>
                <div
                    className="progress"
                    style={{
                        left: `${((minValue - 1) / (largestSize - 1)) * 100}%`,
                        width: `${((maxValue - minValue) / (largestSize - 1)) * 100}%`,
                    }}
                ></div>
            </div>
            <div className={isOn ? "range-input" : "size-off range-input"}>
                <input
                    type="range"
                    className="range-min"
                    min="1"
                    max={largestSize} // Update max attribute
                    value={minValue}
                    step="1"
                    onChange={handleMinSliderChange}
                />
                <input
                    type="range"
                    className="range-max"
                    min="1"
                    max={largestSize} // Update max attribute
                    value={maxValue}
                    step="1"
                    onChange={handleMaxSliderChange}
                />
            </div>
        </div>
    );
};

export default SizeSlider;
