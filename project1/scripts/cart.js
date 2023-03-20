import { shopping } from "../data/shopping.js";

cartTotalItems();
showItems();

function cartTotalItems() {
  const total = document.getElementById("total");

  //get the cart from the localstorage
  const cart = JSON.parse(localStorage.getItem("cart"));

  total.innerHTML = cart.length;
  //find the element with id "total" and set its innerHTML to the number of items in the cart
}

function showItems() {
  //create a list of items to be displayed  on the page, each item with class "item"
  const list = document.createElement("ul");

  //get the cart from the localstorage
  const cart = JSON.parse(localStorage.getItem("cart"));
  //add each item to the list
  cart.forEach((item) => {
    const li = document.createElement("li");
    const div = itemComponent(item);
    li.appendChild(div);
    list.appendChild(li);
  });
  //add the list to the page in the div with id "items"
  document.getElementById("items").appendChild(list);
  cartTotalItems();
}

function removeItem(name, price) {
  //get the cart from localstorage
  const cart = JSON.parse(localStorage.getItem("cart"));
  let indexRemove;
  //find the item in the cart and pop it
  cart.forEach((element, index) => {
    if (element.name === name && element.price === price) {
      indexRemove = index;
    }
  });

  console.log(indexRemove);
  const filteredCart = cart.filter((item, index) => index !== indexRemove);
  //save the cart to localstorage
  localStorage.setItem("cart", JSON.stringify(filteredCart));
  //reload page
  location.reload();
}

function itemComponent(item) {
  //create a div to append the name and the price of the item
  const div = document.createElement("div");
  div.className = "item";

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
  div2.className = "remove-button";
  //add a button to the item
  const button = document.createElement("button");
  button.innerHTML = "Remove from cart";
  button.addEventListener("click", () => removeItem(item.name, item.price));
  div2.appendChild(button);
  div.appendChild(div2);
  //add the item to the cart when clicked
  return div;
}
