import{r as n}from"./chunks/index.055cdd32.js";import{j as e}from"./chunks/jsx-runtime.c9d3903f.js";function i(r){const[t,o]=n.exports.useState(null);function s(){t===r.correctIndex?alert("Correct!"):alert("Incorrect!")}return e.exports.jsx(e.exports.Fragment,{children:e.exports.jsx("div",{className:"mx-auto",children:e.exports.jsxs("div",{className:"bg-gray-100 p-6 mb-12 border border-gray-300 rounded-xl flex flex-col items-center ",children:[e.exports.jsx("div",{className:"text-xl font-bold",children:r.question}),e.exports.jsx("div",{children:r.answers.map((a,l)=>e.exports.jsxs("div",{className:"form-check",children:[e.exports.jsx("input",{className:"form-check-input appearance-none rounded-full h-4 w-4 border border-gray-300 bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer",type:"radio",name:"flexRadioDefault",id:"flexRadioDefault1",checked:l==t,onChange:()=>o(l)}),e.exports.jsx("label",{className:"max-w-sm form-check-label inline-block text-gray-800",htmlFor:"flexRadioDefault1",children:a})]}))}),e.exports.jsx("button",{className:"bg-blue-500 hover:bg-blue-300 text-white rounded-lg py-2 px-4 mt-4 disabled:bg-slate-300 disabled:text-slate-500",onClick:()=>s(),disabled:t===null,children:"Check answer"})]})})})}export{i as Poll};
