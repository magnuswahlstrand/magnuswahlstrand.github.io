// @flow
import * as React from 'react';
import {useState} from 'react';

type Props = {
    question: string,
    answers: string[]
    correctIndex: number,
};


export function Poll(props: Props) {
    const [selected, setSelected] = useState<number | null>(null);

    function handleCheckAnswer() {
        if (selected === props.correctIndex) {
            alert('Correct!');
        } else {
            alert('Incorrect!');
        }
    }

    return (
        <>

        <div className="mx-auto">
            <div className="bg-gray-100 p-6 mb-12 border border-gray-300 rounded-xl flex flex-col items-center ">
                <div className="text-xl font-bold">{props.question}</div>
                <div>
                {props.answers.map((answer, index) => (
                    <div className="form-check">
                        <input
                            className="form-check-input appearance-none rounded-full h-4 w-4 border border-gray-300 bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
                            type="radio" name="flexRadioDefault" id="flexRadioDefault1"
                            checked={index == selected}
                            onChange={() => setSelected(index)}
                        />
                        <label className="max-w-sm form-check-label inline-block text-gray-800" htmlFor="flexRadioDefault1">
                            {answer}
                        </label>
                    </div>))
                }
                </div>
                <button className="bg-blue-500 hover:bg-blue-300 text-white rounded-lg py-2 px-4 mt-4 disabled:bg-slate-300 disabled:text-slate-500"
                        onClick={() => handleCheckAnswer()}
                        disabled={selected === null}>
                    Check answer
                </button>
            </div>
        </div>
        </>
    );
};
