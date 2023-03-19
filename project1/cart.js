import { shopping } from "./shopping.js";

showItems();

function cartTotalItems() {
  const total = document.getElementById("total");
  total.innerHTML = shopping.cart.length;
  //find the element with id "total" and set its innerHTML to the number of items in the cart
}

function showItems() {
  //create a list of items to be displayed  on the page, each item with class "item"
  const list = document.createElement("ul");
  //add each item to the list
  shopping.cart.forEach((item) => {
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
  button.addEventListener("click", () => addToCart(item));
  div2.appendChild(button);
  div.appendChild(div2);
  //add the item to the cart when clicked
  return div;
}
