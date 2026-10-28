const products = [
  {id:1,name:"Everyday Training Tee",category:"Apparel",price:899,rating:4.9,tag:"BESTSELLER",color:"Black",image:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=85",description:"A soft, breathable training tee with a clean athletic fit. Made for warm-ups, heavy sets, and the rest of your day."},
  {id:2,name:"Performance Hoodie",category:"Apparel",price:1799,rating:4.8,tag:"NEW DROP",color:"Charcoal",image:"https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=85",description:"Your reliable layer before and after training. Relaxed fit, soft-touch fabric, and a minimal finish."},
  {id:3,name:"Pro Resistance Bands",category:"Equipment",price:699,rating:4.9,tag:"TOP RATED",color:"Multi",image:"https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=800&q=85",description:"A versatile resistance band set for mobility, warm-ups, and strength work at home or on the go."},
  {id:4,name:"Grip Training Gloves",category:"Accessories",price:549,rating:4.7,tag:"ESSENTIAL",color:"Black",image:"https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=85",description:"Comfortable grip support with a secure fit for lifting sessions. Built to feel good from the first set to the last."},
  {id:5,name:"Insulated Steel Bottle",category:"Accessories",price:799,rating:4.8,tag:"DAILY PICK",color:"Steel",image:"https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=85",description:"A durable, reusable bottle to keep hydration close through workouts, commutes, and long days."},
  {id:6,name:"Training Duffel 24L",category:"Equipment",price:1499,rating:4.9,tag:"STAFF PICK",color:"Olive",image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=85",description:"A practical 24-litre carry-all with room for your training essentials and a streamlined everyday shape."}
];
const money = amount => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(amount);
const $ = selector => document.querySelector(selector);
const productGrid = $("#productGrid");
let activeCategory = "All";
let searchTerm = "";
let cart = JSON.parse(localStorage.getItem("fitforge-cart") || "[]");
let toastTimer;

function getVisibleProducts(){
  let list = products.filter(p => (activeCategory === "All" || p.category === activeCategory) && (p.name+" "+p.category+" "+p.color).toLowerCase().includes(searchTerm.toLowerCase()));
  const sort = $("#sortSelect").value;
  if(sort === "low") list.sort((a,b)=>a.price-b.price);
  if(sort === "high") list.sort((a,b)=>b.price-a.price);
  if(sort === "rating") list.sort((a,b)=>b.rating-a.rating);
  return list;
}
function renderProducts(){
  const list = getVisibleProducts();
  productGrid.innerHTML = list.map(p => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img class="product-image" src="${p.image}" alt="${p.name}" loading="lazy">
        <span class="product-tag">${p.tag}</span>
        <button class="quick-view" data-view="${p.id}">QUICK VIEW ↗</button>
      </div>
      <div class="product-info"><div><h3>${p.name}</h3><span class="product-category">${p.category} · ${p.color}</span></div><span class="product-price">${money(p.price)}</span></div>
      <div class="product-rating"><span>★★★★★</span> ${p.rating} <span style="color:#8b8d84">(${Math.floor(p.rating*83)} reviews)</span></div>
      <button class="add-btn" data-add="${p.id}">ADD TO BAG +</button>
    </article>`).join("");
  $("#emptyState").hidden = list.length > 0;
  productGrid.hidden = list.length === 0;
}
function saveCart(){ localStorage.setItem("fitforge-cart",JSON.stringify(cart)); renderCart(); }
function addToCart(id){
  const item = cart.find(x=>x.id===id);
  if(item) item.qty += 1; else cart.push({id,qty:1});
  saveCart(); showToast(`${products.find(p=>p.id===id).name} added to your bag.`);
}
function changeQty(id,delta){
  const item = cart.find(x=>x.id===id);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0) cart = cart.filter(x=>x.id!==id);
  saveCart();
}
function renderCart(){
  const count = cart.reduce((sum,x)=>sum+x.qty,0);
  const total = cart.reduce((sum,x)=>sum+products.find(p=>p.id===x.id).price*x.qty,0);
  $("#cartCount").textContent = count;
  $("#drawerCount").textContent = `(${count})`;
  $("#cartSubtotal").textContent = money(total);
  $("#cartItems").innerHTML = cart.map(item=>{
    const p = products.find(x=>x.id===item.id);
    return `<div class="cart-item"><img src="${p.image}" alt="${p.name}"><div><h4>${p.name}</h4><span class="item-price">${money(p.price)}</span><div class="quantity-control"><button data-qty="${p.id}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${item.qty}</span><button data-qty="${p.id}" data-delta="1" aria-label="Increase quantity">+</button></div></div><button class="remove-item" data-remove="${p.id}" aria-label="Remove ${p.name}">×</button></div>`;
  }).join("");
  const empty = count === 0;
  $("#cartEmpty").style.display = empty ? "block" : "none";
  $("#cartFooter").style.display = empty ? "none" : "block";
  $("#cartItems").style.display = empty ? "none" : "block";
  const remaining = Math.max(0,1999-total);
  $("#shippingMessage").textContent = remaining ? `You're ${money(remaining)} away from free shipping.` : "You've unlocked free shipping!";
  $("#shippingProgress").style.width = `${Math.min(100,total/1999*100)}%`;
}
function openCart(){
  $("#cartDrawer").classList.add("open"); $("#overlay").classList.add("open");
  $("#cartDrawer").setAttribute("aria-hidden","false"); document.body.classList.add("no-scroll");
}
function closeCart(){
  $("#cartDrawer").classList.remove("open"); $("#overlay").classList.remove("open");
  $("#cartDrawer").setAttribute("aria-hidden","true"); document.body.classList.remove("no-scroll");
}
function showToast(message){
  const toast=$("#toast"); toast.textContent=message; toast.classList.add("show");
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.remove("show"),2500);
}
function openProduct(id){
  const p=products.find(x=>x.id===id);
  $("#modalContent").innerHTML=`<div class="modal-layout"><img src="${p.image}" alt="${p.name}"><div><span class="product-category">${p.category} / ${p.color}</span><h2>${p.name}</h2><div class="product-rating"><span>★★★★★</span> ${p.rating} / 5</div><p class="modal-price">${money(p.price)}</p><p>${p.description}</p><p>✓ Quality-tested essentials<br>✓ Easy 30-day returns<br>✓ Secure demo checkout</p><button class="btn btn-primary" data-modal-add="${p.id}">ADD TO BAG <span>↗</span></button></div></div>`;
  $("#productModal").hidden=false; document.body.classList.add("no-scroll");
}
function closeProduct(){ $("#productModal").hidden=true; document.body.classList.remove("no-scroll"); }
function setCategory(category){
  activeCategory=category;
  document.querySelectorAll(".filter-btn").forEach(btn=>btn.classList.toggle("active",btn.dataset.filter===category));
  renderProducts();
}
$("#filters").addEventListener("click",e=>{const btn=e.target.closest("[data-filter]");if(btn)setCategory(btn.dataset.filter);});
document.querySelectorAll(".collection-card").forEach(card=>card.addEventListener("click",()=>setCategory(card.dataset.category)));
productGrid.addEventListener("click",e=>{
  const add=e.target.closest("[data-add]"); const view=e.target.closest("[data-view]");
  if(add)addToCart(Number(add.dataset.add));
  if(view)openProduct(Number(view.dataset.view));
});
$("#cartItems").addEventListener("click",e=>{
  const qty=e.target.closest("[data-qty]"); const remove=e.target.closest("[data-remove]");
  if(qty)changeQty(Number(qty.dataset.qty),Number(qty.dataset.delta));
  if(remove){cart=cart.filter(x=>x.id!==Number(remove.dataset.remove));saveCart();}
});
$("#cartOpen").addEventListener("click",openCart);
$("#cartClose").addEventListener("click",closeCart);
$("#overlay").addEventListener("click",closeCart);
$("#continueShopping").addEventListener("click",closeCart);
$("#checkoutBtn").addEventListener("click",()=>{
  const total=cart.reduce((sum,x)=>sum+products.find(p=>p.id===x.id).price*x.qty,0);
  if(!cart.length)return;
  const orderId="FF"+Math.random().toString(36).slice(2,8).toUpperCase();
  $("#modalContent").innerHTML=`<div style="text-align:center;padding:35px 10px"><div style="font-size:42px;color:#819a1f">✓</div><p class="eyebrow">DEMO ORDER CREATED</p><h2 style="font:700 30px var(--display)">YOU'RE ON YOUR WAY.</h2><p style="font-size:13px;color:#73766d;line-height:1.8">Order reference: <strong>${orderId}</strong><br>Demo total: <strong>${money(total)}</strong><br><br>This portfolio checkout is simulated. No payment was taken and no order was sent to a real store.</p><button class="btn btn-primary" id="finishOrder">BACK TO SHOP ↗</button></div>`;
  $("#productModal").hidden=false; closeCart();
  cart=[];saveCart();
});
$("#productModal").addEventListener("click",e=>{
  if(e.target.id==="productModal"||e.target.id==="modalClose")closeProduct();
  const add=e.target.closest("[data-modal-add]");
  if(add){addToCart(Number(add.dataset.modalAdd));closeProduct();openCart();}
  if(e.target.id==="finishOrder")closeProduct();
});
$("#modalClose").addEventListener("click",closeProduct);
$("#sortSelect").addEventListener("change",renderProducts);
$("#searchToggle").addEventListener("click",()=>{
  const panel=$("#searchPanel");panel.hidden=!panel.hidden;
  if(!panel.hidden){$("#searchInput").focus();panel.scrollIntoView({behavior:"smooth",block:"nearest"});}
});
$("#searchInput").addEventListener("input",e=>{searchTerm=e.target.value;renderProducts();});
$("#clearSearch").addEventListener("click",()=>{$("#searchInput").value="";searchTerm="";renderProducts();});
$("#resetFilters").addEventListener("click",()=>{setCategory("All");searchTerm="";$("#searchInput").value="";$("#sortSelect").value="featured";renderProducts();});
$("#clearAll").addEventListener("click",()=>{$("#resetFilters").click();});
$("#menuToggle").addEventListener("click",()=>{
  const nav=$("#mainNav");const open=nav.classList.toggle("open");
  $("#menuToggle").setAttribute("aria-expanded",String(open));$("#menuToggle").textContent=open?"×":"☰";
});
$("#mainNav").addEventListener("click",e=>{if(e.target.closest("a")){$("#mainNav").classList.remove("open");$("#menuToggle").setAttribute("aria-expanded","false");$("#menuToggle").textContent="☰";}});
$("#newsletterForm").addEventListener("submit",e=>{
  e.preventDefault();const email=$("#emailInput").value.trim();
  if(!email)return;
  $("#newsletterMessage").textContent=`You're on the list! (Demo signup for ${email})`;
  $("#newsletterMessage").style.color="#d5ff3f";$("#emailInput").value="";
});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeCart();closeProduct();$("#mainNav").classList.remove("open");}});
renderProducts();renderCart();
