const l=document.querySelector("#theme-btn"),t=document.querySelector("html")?.classList;l?.addEventListener("click",function(){t?.contains("theme-dark")?(localStorage.setItem("theme","light"),t?.remove("theme-dark")):(localStorage.setItem("theme","dark"),t?.add("theme-dark"))});const c=document.querySelector(".hamburger-menu"),o=document.querySelector("nav")?.classList,e=document.querySelector(".icon-container")?.classList,n=document.querySelector("#first-line")?.classList,s=document.querySelector("#second-line ")?.classList,a=document.querySelector("#third-line")?.classList;c.addEventListener("click",function(){o?.contains("display-none")?(o?.remove("display-none"),e?.remove("flex"),e?.add("relative"),n?.add("rotate-45","absolute","bottom-1/2"),a?.add("display-none"),s?.add("!w-full","-rotate-45","absolute","bottom-1/2")):(o?.add("display-none"),e?.add("flex"),e?.remove("relative"),n?.remove("rotate-45","absolute","bottom-1/2"),a?.remove("display-none"),s?.remove("!w-full","-rotate-45","absolute","bottom-1/2"))});