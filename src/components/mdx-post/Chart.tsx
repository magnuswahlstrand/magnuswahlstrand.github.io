import * as React from "react";
import {useState} from "react";

type years = 2020 | 2021 | 2022;

const yearlyData = new Map<years, number[]>([
    [2020, [2, 2.5, 1, 1.5, 1, 2.5, 4, 0.5, 0, 3, 2, 0.5]],
    [2021, [3, 1.5, 2, 2, 1.7, 1.8, 2.5, 0.5, 1, 4, 2, 0.1]],
    [2022, [4, 1, 1, 1.5, 0.5, 2.5, 3, 0.5, 0, 3, 3, 4]],
]);

const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

const maxVal = 5;
const multiplier = 30;

type Props = { initialYear: years };

export function Chart(props: Props) {
    const [year, setYear] = useState<years>(props.initialYear);

    const handleChange = (event: any) => {
        setYear(parseInt(event.target.value, 10) as years);
    };

    const yearData = yearlyData.get(year);
    if (!yearData) {
        return <div>Something went wrong</div>;
    }

    return (
        <div className="mx-auto my-5 max-w-xs rounded-lg border-2 border-gray-300 p-6 sm:max-w-lg">
            <div className="text-3xl">
                <p>Lines of code written in year </p>
                <div>
                    <select value={year} onChange={handleChange} className="border rounded-lg">
                        {Array.from(yearlyData, ([key, value]) => (
                            <option key={key} value={key}>
                                {key}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <p className="text-lg">
                Semi-accurate estimation of number of lines of code that I have written
                in a given year. Inspired by reality and then weighted by{" "}
                <a href="https://xkcd.com/221">fair dice roll</a>.
            </p>

            <div
                className="flex items-end justify-center justify-items-stretch"
                style={{height: maxVal * multiplier}}
            >
                {yearData.map((value, index) => {
                    return (
                        <div
                            key={index}
                            className="m-1 block w-full transform bg-orange-500 transition-all hover:bg-orange-300"
                            style={{height: value * multiplier}}
                        ></div>
                    );
                })}
            </div>
            <div className="flex">
                {months.map((month, index) => {
                    return (
                        <div
                            key={index}
                            className="text-bold m-1 w-full text-center text-sm"
                        >
                            <p>{month}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
