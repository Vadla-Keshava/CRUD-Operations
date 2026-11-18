
// Get HTML elements
const productForm = document.getElementById("productForm");
const productList = document.getElementById("productList");
const cartList = document.getElementById("cartList");

const grandTotal = document.getElementById("grandTotal");
const cancelBtn = document.getElementById("cancelBtn");

const detailsDialog = document.getElementById("detailsDialog");
const detailsContent = document.getElementById("detailsContent");

// Default products
const defaultProducts = [
    {
        id: 1,
        name: "Samsung Mobile",
        price: 15000,
        description: "Samsung smartphone with 128GB storage",
        image: "https://placehold.co/300x200?text=Samsung+Mobile"
    },
    {
        id: 2,
        name: "HP Laptop",
        price: 45000,
        description: "HP laptop with 8GB RAM",
        image: "https://placehold.co/300x200?text=HP+Laptop"
    },
    {
        id: 3,
        name: "Headphones",
        price: 1200,
        description: "Wireless Bluetooth headphones",
        image: "https://placehold.co/300x200?text=Headphones"
    },
    {
        id: 4,
        name: "Smart Watch",
        price: 2500,
        description: "Smart watch with fitness tracking",
        image: "https://placehold.co/300x200?text=Smart+Watch"
    }
];

// LocalStorage data
let products = JSON.parse(localStorage.getItem("products")) || defaultProducts;
let cart = JSON.parse(localStorage.getItem("cart")) || [];

let editingId = null;

// Save data
function saveData() {
    localStorage.setItem("products", JSON.stringify(products));
    localStorage.setItem("cart", JSON.stringify(cart));
}

// Escape text before displaying it in HTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Allow only HTTP or HTTPS image URLs
function safeImageURL(url) {
    try {
        const parsed = new URL(url);

        if (parsed.protocol === "https:" || parsed.protocol === "http:") {
            return escapeHTML(url);
        }
    } catch (error) {
        // Invalid URL
    }

    return "https://placehold.co/300x200?text=No+Image";
}

// Display products (READ)
function displayProducts() {
    productList.innerHTML = "";

    if (products.length === 0) {
        productList.innerHTML = "<p>No products available.</p>";
        return;
    }

    products.forEach(product => {
        productList.innerHTML += `
            <div class="product-card">

                <img
                    src="${safeImageURL(product.image)}"
                    alt="${escapeHTML(product.name)}"
                >

                <h3>${escapeHTML(product.name)}</h3>

                <p class="product-price">
                    ₹${product.price}
                </p>

                <p>${escapeHTML(product.description)}</p>

                <button
                    class="details-btn"
                    onclick="showDetails(${product.id})">
                    Details
                </button>

                <button
                    class="add-btn"
                    onclick="addToCart(${product.id})">
                    Add to Cart
                </button>

                <button
                    class="edit-btn"
                    onclick="editProduct(${product.id})">
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteProduct(${product.id})">
                    Delete
                </button>

            </div>
        `;
    });
}

// CREATE and UPDATE product
productForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("productName").value.trim();
    const price = Number(document.getElementById("productPrice").value);
    const description = document.getElementById("productDescription").value.trim();
    const image = document.getElementById("productImage").value.trim();

    if (!name || !description || !image || !Number.isFinite(price) || price <= 0) {
        alert("Please enter valid product details.");
        return;
    }

    try {
        const parsedImage = new URL(image);

        if (!["https:", "http:"].includes(parsedImage.protocol)) {
            alert("Please enter a valid HTTP or HTTPS image URL.");
            return;
        }
    } catch {
        alert("Please enter a valid image URL.");
        return;
    }

    if (editingId !== null) {

        // UPDATE
        const product = products.find(p => p.id === editingId);

        if (!product) return;

        product.name = name;
        product.price = price;
        product.description = description;
        product.image = image;

        // Update existing cart item
        cart.forEach(item => {
            if (item.id === editingId) {
                item.name = name;
                item.price = price;
                item.image = image;
            }
        });

        alert("Product updated successfully!");

    } else {

        // CREATE
        const newProduct = {
            id: Date.now(),
            name: name,
            price: price,
            description: description,
            image: image
        };

        products.push(newProduct);

        alert("Product added successfully!");
    }

    editingId = null;

    productForm.reset();

    document.getElementById("formTitle").innerText = "Add New Product";
    document.getElementById("submitBtn").innerText = "Add Product";

    cancelBtn.hidden = true;

    saveData();
    displayProducts();
    displayCart();
});

// EDIT product
function editProduct(id) {
    const product = products.find(p => p.id === id);

    if (!product) return;

    document.getElementById("productName").value = product.name;
    document.getElementById("productPrice").value = product.price;
    document.getElementById("productDescription").value = product.description;
    document.getElementById("productImage").value = product.image || "";

    editingId = id;

    document.getElementById("formTitle").innerText = "Edit Product";
    document.getElementById("submitBtn").innerText = "Update Product";

    cancelBtn.hidden = false;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Cancel edit
cancelBtn.addEventListener("click", function() {
    editingId = null;

    productForm.reset();

    document.getElementById("formTitle").innerText = "Add New Product";
    document.getElementById("submitBtn").innerText = "Add Product";

    cancelBtn.hidden = true;
});

// DELETE product
function deleteProduct(id) {
    const confirmDelete = confirm("Do you want to delete this product?");

    if (!confirmDelete) return;

    products = products.filter(product => product.id !== id);

    // Remove product from cart too
    cart = cart.filter(item => item.id !== id);

    saveData();

    displayProducts();
    displayCart();
}

// PRODUCT DETAILS
function showDetails(id) {
    const product = products.find(p => p.id === id);

    if (!product) return;

    detailsContent.innerHTML = `
        <h2>${escapeHTML(product.name)}</h2>

        <img
            src="${safeImageURL(product.image)}"
            alt="${escapeHTML(product.name)}"
        >

        <h3>Price: ₹${product.price}</h3>

        <p>${escapeHTML(product.description)}</p>
    `;

    detailsDialog.showModal();
}

// Close details
document.getElementById("closeDetails").addEventListener("click", function() {
    detailsDialog.close();
});

// ADD TO CART
function addToCart(id) {
    const product = products.find(p => p.id === id);

    if (!product) return;

    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {

        existingItem.quantity++;

    } else {

        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });

    }

    saveData();
    displayCart();

    alert("Product added to cart!");
}

// INCREASE AND DECREASE QUANTITY
function changeQuantity(id, change) {
    const item = cart.find(item => item.id === id);

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        cart = cart.filter(item => item.id !== id);
    }

    saveData();
    displayCart();
}

// DELETE cart item
function deleteCartItem(id) {
    cart = cart.filter(item => item.id !== id);

    saveData();
    displayCart();
}

// DISPLAY CART
function displayCart() {
    cartList.innerHTML = "";

    let total = 0;

    if (cart.length === 0) {
        cartList.innerHTML = "<p>Your shopping cart is empty.</p>";
    }

    cart.forEach(item => {
        const subtotal = item.price * item.quantity;

        total += subtotal;

        cartList.innerHTML += `
            <div class="cart-item">

                <img
                    src="${safeImageURL(item.image)}"
                    alt="${escapeHTML(item.name)}"
                >

                <div class="cart-info">

                    <h3>${escapeHTML(item.name)}</h3>

                    <p>Price: ₹${item.price}</p>

                    <p>Subtotal: ₹${subtotal}</p>

                </div>

                <div class="quantity">

                    <button onclick="changeQuantity(${item.id}, -1)">
                        -
                    </button>

                    <span>${item.quantity}</span>

                    <button onclick="changeQuantity(${item.id}, 1)">
                        +
                    </button>

                </div>

                <button
                    class="delete-btn"
                    onclick="deleteCartItem(${item.id})">
                    Remove
                </button>

            </div>
        `;
    });

    grandTotal.innerText = "Total: ₹" + total;
}

// Initial display
displayProducts();
displayCart();
