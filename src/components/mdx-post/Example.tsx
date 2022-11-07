// @flow
import * as React from 'react';
import {useState} from 'react';

type Props = {
    initialValue: number,
};

export default function Example(props: Props) {
    const [counter, setCounter] = useState(props.initialValue);
    return (
        <div className="flex justify-center">
            <button className="bg-indigo-300 rounded-lg py-2 px-4 hover:bg-indigo-100"
                onClick={() => setCounter(v => v + 1)}
            >I'm a JSX component! You have clicked me <b>{counter}</b> times.</button>
        </div>
    );
};
