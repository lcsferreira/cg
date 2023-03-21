import { shopping } from "../data/shopping.js";

showItems();
cartTotalItems();

function cartTotalItems() {
  const total = document.getElementById("total");
  //if there is no cart in the localstorage, set the number of items in the cart to 0
  if (!localStorage.getItem("cart")) {
    localStorage.setItem("cart", JSON.stringify([]));
  }

  //get the cart from the localstorage
  const cart = JSON.parse(localStorage.getItem("cart"));
  //get the number of items in the cart

  total.innerHTML = cart.length;
  //find the element with id "total" and set its innerHTML to the number of items in the cart
}

function addToCart(item) {
  //create a localstorage item called "cart" if it doesn't exist
  if (!localStorage.getItem("cart")) {
    localStorage.setItem("cart", JSON.stringify([]));
  }
  //get the cart from localstorage
  const cart = JSON.parse(localStorage.getItem("cart"));
  //add the item to the cart
  cart.push(item);
  //save the cart to localstorage
  localStorage.setItem("cart", JSON.stringify(cart));
  //update the cart total items
  cartTotalItems();
}

function showItems() {
  //create a list of items to be displayed  on the page, each item with class "item"
  const list = document.createElement("ul");
  //add each item to the list
  shopping.itens.forEach((item) => {
    const li = document.createElement("li");
    const div = itemComponent(item);
    li.appendChild(div);
    list.appendChild(li);
  });
  //add the list to the page in the div with id "items"
  document.getElementById("items").appendChild(list);
}

function itemComponent(item) {
  //create a div to append the name and the price of the item
  const div = document.createElement("div");
  div.className = "item";

  //create a div to append a canvas with id "object"
  const div0 = document.createElement("div");
  div0.className = "object";
  //add a canvas to the item
  const canvas = document.createElement("canvas");
  canvas.id = "object";
  canvas.width = 300;
  canvas.height = 200;
  div0.appendChild(canvas);
  div.appendChild(div0);

  const div1 = document.createElement("div");
  div1.className = "info";
  //add a name to the item
  const name = document.createElement("p");
  name.innerHTML = item.name;
  div1.appendChild(name);
  //add a price to the item
  const price = document.createElement("p");
  price.innerHTML = item.price;
  div1.appendChild(price);
  div.appendChild(div1);

  //create another div to append the button
  const div2 = document.createElement("div");
  div2.className = "button";
  //add a button to the item
  const button = document.createElement("button");
  button.innerHTML = "Add to cart";
  button.addEventListener("click", () => addToCart(item));
  div2.appendChild(button);
  div.appendChild(div2);
  //add the item to the cart when clicked
  return div;
}
