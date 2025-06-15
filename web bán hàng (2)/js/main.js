const SERVER_URL = 'http://localhost:8080'; // Cập nhật URL server nếu cần

// Định dạng tiền VND
function vnd(price) {
    return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

// Đóng popup
const body = document.querySelector("body");
let modalContainer = document.querySelectorAll('.modal');
let modalBox = document.querySelectorAll('.mdl-cnt');

// Click vùng ngoài để đóng modal
modalContainer.forEach(item => {
    item.addEventListener('click', closeModal);
});

modalBox.forEach(item => {
    item.addEventListener('click', function (event) {
        event.stopPropagation();
    });
});

function closeModal() {
    modalContainer.forEach(item => {
        item.classList.remove('open');
    });
    body.style.overflow = "auto";
}

// Tăng/giảm số lượng
function increasingNumber(e) {
    let qty = e.parentNode.querySelector('.input-qty');
    if (parseInt(qty.value) < qty.max) {
        qty.value = parseInt(qty.value) + 1;
    } else {
        qty.value = qty.max;
    }
}

function decreasingNumber(e) {
    let qty = e.parentNode.querySelector('.input-qty');
    if (qty.value > qty.min) {
        qty.value = parseInt(qty.value) - 1;
    } else {
        qty.value = qty.min;
    }
}

// Xem chi tiết sản phẩm
function detailProduct(index) {
    let modal = document.querySelector('.modal.product-detail');
    let products = JSON.parse(localStorage.getItem('products')) || [];
    event.preventDefault();
    let infoProduct = products.find(sp => sp.id === index);
    if (!infoProduct) {
        toast({ title: 'Lỗi', message: 'Sản phẩm không tồn tại!', type: 'error', duration: 3000 });
        return;
    }
    let modalHtml = `
        <div class="modal-header">
            <img class="product-image" src="${infoProduct.img}" alt="${infoProduct.title}">
        </div>
        <div class="modal-body">
            <h2 class="product-title">${infoProduct.title}</h2>
            <div class="product-control">
                <div class="priceBox">
                    <span class="current-price">${vnd(infoProduct.price)}</span>
                </div>
                <div class="buttons_added">
                    <input class="minus is-form" type="button" value="-" onclick="decreasingNumber(this)">
                    <input class="input-qty" max="100" min="1" name="" type="number" value="1">
                    <input class="plus is-form" type="button" value="+" onclick="increasingNumber(this)">
                </div>
            </div>
            <p class="product-description">${infoProduct.desc}</p>
        </div>
        <div class="notebox">
            <p class="notebox-title">Ghi chú</p>
            <textarea class="text-note" id="popup-detail-note" placeholder="Nhập thông tin cần lưu ý..."></textarea>
        </div>
        <div class="modal-footer">
            <div class="price-total">
                <span class="thanhtien">Thành tiền</span>
                <span class="price">${vnd(infoProduct.price)}</span>
            </div>
            <div class="modal-footer-control">
                <button class="button-dathangngay" data-product="${infoProduct.id}">Đặt hàng ngay</button>
                <button class="button-dat" id="add-cart" onclick="animationCart()"><i class="fas fa-cart-shopping"></i></button>
            </div>
        </div>`;
    document.querySelector('#product-detail-content').innerHTML = modalHtml;
    modal.classList.add('open');
    body.style.overflow = "hidden";

    // Cập nhật giá tiền khi thay đổi số lượng
    let tgbtn = document.querySelectorAll('.is-form');
    let qty = document.querySelector('.product-control .input-qty');
    let priceText = document.querySelector('.price');
    tgbtn.forEach(element => {
        element.addEventListener('click', () => {
            let price = infoProduct.price * parseInt(qty.value);
            priceText.innerHTML = vnd(price);
        });
    });

    // Thêm sản phẩm vào giỏ hàng
    let productbtn = document.querySelector('.button-dat');
    productbtn.addEventListener('click', () => {
        if (localStorage.getItem('currentuser')) {
            addCart(infoProduct.id);
        } else {
            toast({ title: 'Cảnh báo', message: 'Chưa đăng nhập tài khoản!', type: 'warning', duration: 3000 });
        }
    });

    // Đặt hàng ngay
    // let buyNowBtn = document.querySelector('.button-dathangngay');
    // buyNowBtn.addEventListener('click', () => {
    //     if (localStorage.getItem('currentuser')) {
    //         addCart(infoProduct.id);
    //         checkout();
    //     } else {
    //         toast({ title: 'Cảnh báo', message: 'Chưa đăng nhập tài khoản!', type: 'warning', duration: 3000 });
    //     }
    // });
    let buyNowBtn = document.querySelector('.button-dathangngay');
    buyNowBtn.addEventListener('click', () => {
        if (!localStorage.getItem('currentuser')) {
            toast({ title: 'Cảnh báo', message: 'Chưa đăng nhập tài khoản!', type: 'warning', duration: 3000 });
            return;
        }

        // Mở modal checkout và lưu tạm sản phẩm đang mua
        document.querySelector('.modal-checkout').classList.add('open');
        body.style.overflow = 'hidden';

        const qty = parseInt(document.querySelector('.input-qty').value);
        const note = document.getElementById('popup-detail-note').value || "Không có ghi chú";

        // Ghi vào sessionStorage để checkout sau
        sessionStorage.setItem('buyNowTemp', JSON.stringify({
            id: infoProduct.id,
            soluong: qty,
            note: note,
            price: infoProduct.price
        }));
    });
}

// Hiệu ứng giỏ hàng
function animationCart() {
    let count = document.querySelector(".count-product-cart");
    count.style.animation = "slidein ease 1s";
    setTimeout(() => {
        count.style.animation = "none";
    }, 1000);
}

// Thêm sản phẩm vào giỏ hàng
function addCart(index) {
    let currentuser = JSON.parse(localStorage.getItem('currentuser')) || { cart: [] };
    let soluong = document.querySelector('.input-qty').value;
    let popupDetailNote = document.querySelector('#popup-detail-note').value;
    let note = popupDetailNote === "" ? "Không có ghi chú" : popupDetailNote;
    let productcart = {
        id: index,
        soluong: parseInt(soluong),
        note: note
    };
    let vitri = currentuser.cart.findIndex(item => item.id == productcart.id);
    if (vitri === -1) {
        currentuser.cart.push(productcart);
    } else {
        currentuser.cart[vitri].soluong = parseInt(currentuser.cart[vitri].soluong) + parseInt(productcart.soluong);
    }
    localStorage.setItem('currentuser', JSON.stringify(currentuser));
    updateAmount();
    closeModal();
    toast({ title: 'Thành công', message: 'Thêm thành công sản phẩm vào giỏ hàng', type: 'success', duration: 3000 });
}

// Hiển thị giỏ hàng
function showCart() {
    let modalCart = document.querySelector('.modal-cart');
    let containerCart = document.querySelector('.cart-container');
    if (!modalCart || !containerCart) {
        console.error('Không tìm thấy modal-cart hoặc cart-container');
        toast({ title: 'Lỗi', message: 'Lỗi hiển thị giỏ hàng!', type: 'error', duration: 3000 });
        return;
    }

    let currentuser = JSON.parse(localStorage.getItem('currentuser')) || { cart: [] };
    let productcarthtml = '';
    if (currentuser.cart.length === 0) {
        document.querySelector('.gio-hang-trong').style.display = 'flex';
        document.querySelector('.cart-list').style.display = 'none';
        document.querySelector('button.thanh-toan').classList.add('disabled');
    } else {
        document.querySelector('.gio-hang-trong').style.display = 'none';
        document.querySelector('.cart-list').style.display = 'block';
        document.querySelector('button.thanh-toan').classList.remove('disabled');
        currentuser.cart.forEach(item => {
            let product = getProduct(item);
            productcarthtml += `
                <li class="cart-item" data-id="${product.id}">
                    <div class="cart-item-info">
                        <p class="cart-item-title">${product.title}</p>
                        <span class="cart-item-price price" data-price="${product.price}">${vnd(parseInt(product.price))}</span>
                    </div>
                    <p class="product-note"><i class="fa-light fa-pencil"></i><span>${product.note}</span></p>
                    <div class="cart-item-control">
                        <button class="cart-item-delete" onclick="deleteCartItem(${product.id}, this)">Xóa</button>
                        <div class="buttons_added">
                            <input class="minus is-form" type="button" value="-" onclick="decreasingNumber(this); saveAmountCart();">
                            <input class="input-qty" max="100" min="1" name="" type="number" value="${product.soluong}">
                            <input class="plus is-form" type="button" value="+" onclick="increasingNumber(this); saveAmountCart();">
                        </div>
                    </div>
                </li>`;
        });
        document.querySelector('.cart-list').innerHTML = productcarthtml;
        updateCartTotal();
        saveAmountCart();
    }

    modalCart.classList.add('open');
    body.style.overflow = "hidden";

    // Sự kiện đóng giỏ hàng
    modalCart.onclick = function (e) {
        if (e.target === modalCart) {
            closeCart();
        }
    };
    containerCart.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// Xóa sản phẩm khỏi giỏ hàng
function deleteCartItem(id, el) {
    let currentUser = JSON.parse(localStorage.getItem('currentuser'));
    let vitri = currentUser.cart.findIndex(item => item.id == id);
    if (vitri !== -1) {
        currentUser.cart.splice(vitri, 1);
        localStorage.setItem('currentuser', JSON.stringify(currentUser));
        el.closest('.cart-item').remove();
        if (currentUser.cart.length === 0) {
            document.querySelector('.gio-hang-trong').style.display = 'flex';
            document.querySelector('.cart-list').style.display = 'none';
            document.querySelector('button.thanh-toan').classList.add('disabled');
        }
        updateCartTotal();
        updateAmount();
        toast({ title: 'Thành công', message: 'Đã xóa sản phẩm khỏi giỏ hàng!', type: 'success', duration: 3000 });
    }
}

// Cập nhật tổng tiền giỏ hàng
function updateCartTotal() {
    let total = getCartTotal();
    document.querySelector('.text-price').innerText = vnd(total);
}

// Lấy tổng tiền đơn hàng
function getCartTotal() {
    let currentUser = JSON.parse(localStorage.getItem('currentuser')) || { cart: [] };
    let tongtien = 0;
    currentUser.cart.forEach(item => {
        let product = getProduct(item);
        tongtien += parseInt(product.soluong) * parseInt(product.price);
    });
    return tongtien;
}

// Lấy thông tin sản phẩm
function getProduct(item) {
    let products = JSON.parse(localStorage.getItem('products')) || [];
    let infoProductCart = products.find(sp => item.id == sp.id);
    return { ...infoProductCart, ...item };
}

// Lấy số lượng sản phẩm trong giỏ
function getAmountCart() {
    let currentuser = JSON.parse(localStorage.getItem('currentuser')) || { cart: [] };
    let amount = 0;
    currentuser.cart.forEach(element => {
        amount += parseInt(element.soluong);
    });
    return amount;
}

// Cập nhật số lượng sản phẩm trong giỏ
function updateAmount() {
    let amount = getAmountCart();
    document.querySelector('.count-product-cart').innerText = amount;
}

// Lưu số lượng sản phẩm trong giỏ
function saveAmountCart() {
    let cartAmountbtn = document.querySelectorAll(".cart-item-control .is-form");
    let listProduct = document.querySelectorAll('.cart-item');
    let currentUser = JSON.parse(localStorage.getItem('currentuser'));
    cartAmountbtn.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            let id = listProduct[parseInt(index / 2)].getAttribute("data-id");
            let productId = currentUser.cart.find(item => item.id == id);
            productId.soluong = parseInt(listProduct[parseInt(index / 2)].querySelector(".input-qty").value);
            localStorage.setItem('currentuser', JSON.stringify(currentUser));
            updateCartTotal();
        });
    });
}

// Mở giỏ hàng
function openCart() {
    if (!localStorage.getItem('currentuser')) {
        toast({ title: 'Cảnh báo', message: 'Vui lòng đăng nhập để xem giỏ hàng!', type: 'warning', duration: 3000 });
        return;
    }
    showCart();
}

// Đóng giỏ hàng
function closeCart() {
    const modalCart = document.querySelector('.modal-cart');
    if (modalCart) {
        modalCart.classList.remove('open');
        body.style.overflow = "auto";
        updateAmount();
    }
}

// Kiểm tra trạng thái server
async function checkServerStatus() {
    try {
        const response = await fetch(`${SERVER_URL}/api/health`, { method: 'GET' });
        return response.ok;
    } catch {
        return false;
    }
}

// Thử gửi lại các đơn hàng chưa đồng bộ
async function retryFailedOrders() {
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    if (orders.length === 0) return;

    const serverAvailable = await checkServerStatus();
    if (!serverAvailable) {
        console.log('Server không khả dụng, không thử gửi lại đơn hàng.');
        return;
    }

    let updatedOrders = orders;
    for (const order of orders) {
        try {
            const response = await fetch(`${SERVER_URL}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(order)
            });
            if (!response.ok) {
                throw new Error(`Lỗi server: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            console.log('Đơn hàng gửi lại thành công:', data);
            updatedOrders = updatedOrders.filter(o => o.id !== order.id);
            toast({ title: 'Thành công', message: 'Đã đồng bộ đơn hàng với server!', type: 'success', duration: 3000 });
        } catch (error) {
            console.error('Lỗi gửi lại đơn hàng:', error);
        }
    }
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
}

// Xử lý thanh toán
async function checkout() {
    let currentUser = JSON.parse(localStorage.getItem('currentuser'));
    if (!currentUser || currentUser.cart.length === 0) {
        toast({ title: 'Cảnh báo', message: 'Giỏ hàng trống, vui lòng thêm sản phẩm!', type: 'warning', duration: 3000 });
        return;
    }

    // Tạo đơn hàng giả
    let order = {
        id: createId(JSON.parse(localStorage.getItem('orders') || '[]')),
        userId: currentUser.phone,
        items: currentUser.cart.map(item => ({
            id: item.id,
            soluong: item.soluong,
            note: item.note
        })),
        total: getCartTotal(),
        status: 'fake-paid',
        date: new Date().toISOString()
    };

    // Lưu đơn hàng vào localStorage
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Lưu chi tiết đơn hàng
    let orderDetails = JSON.parse(localStorage.getItem('orderDetails') || '[]');
    order.items.forEach(item => {
        orderDetails.push({
            madon: order.id,
            productId: item.id,
            soluong: item.soluong,
            note: item.note
        });
    });
    localStorage.setItem('orderDetails', JSON.stringify(orderDetails));

    // Xóa giỏ hàng sau khi "thanh toán"
    currentUser.cart = [];
    localStorage.setItem('currentuser', JSON.stringify(currentUser));

    updateAmount();
    updateCartTotal();
    closeCart();

    // Hiển thị thông báo thành công
    toast({ title: 'Thành công', message: 'Đặt hàng thành công!', type: 'success', duration: 3000 });
}

// Gắn sự kiện cho nút thanh toán
// document.querySelector('.thanh-toan').addEventListener('click', checkout);
document.querySelector('.thanh-toan').addEventListener('click', () => {
    if (!localStorage.getItem('currentuser')) {
        toast({ title: 'Cảnh báo', message: 'Vui lòng đăng nhập để thanh toán!', type: 'warning', duration: 3000 });
        return;
    }

    let currentUser = JSON.parse(localStorage.getItem('currentuser'));
    if (currentUser.cart.length === 0) {
        toast({ title: 'Cảnh báo', message: 'Giỏ hàng trống!', type: 'warning', duration: 3000 });
        return;
    }

    document.querySelector('.modal-checkout').classList.add('open');
    body.style.overflow = 'hidden';
});

// Các hàm khác
function openSearchMb() {
    document.querySelector(".header-middle-left").style.display = "none";
    document.querySelector(".header-middle-center").style.display = "block";
    document.querySelector(".header-middle-right-item.close").style.display = "block";
    let liItem = document.querySelectorAll(".header-middle-right-item.open");
    for (let i = 0; i < liItem.length; i++) {
        liItem[i].style.setProperty("display", "none", "important");
    }
}

function closeSearchMb() {
    document.querySelector(".header-middle-left").style.display = "block";
    document.querySelector(".header-middle-center").style.display = "none";
    document.querySelector(".header-middle-right-item.close").style.display = "none";
    let liItem = document.querySelectorAll(".header-middle-right-item.open");
    for (let i = 0; i < liItem.length; i++) {
        liItem[i].style.setProperty("display", "block", "important");
    }
}

function closeSearchAdvanced() {
    document.querySelector(".advanced-search").classList.toggle("open");
}

// Đăng ký và đăng nhập
let signup = document.querySelector('.signup-link');
let login = document.querySelector('.login-link');
let container = document.querySelector('.signup-login .modal-container');
login.addEventListener('click', () => {
    container.classList.add('active');
});

signup.addEventListener('click', () => {
    container.classList.remove('active');
});

let signupbtn = document.getElementById('signup');
let loginbtn = document.getElementById('login');
let formsg = document.querySelector('.modal.signup-login');
signupbtn.addEventListener('click', () => {
    formsg.classList.add('open');
    container.classList.remove('active');
    body.style.overflow = "hidden";
});

loginbtn.addEventListener('click', () => {
    document.querySelector('.form-message-check-login').innerHTML = '';
    formsg.classList.add('open');
    container.classList.add('active');
    body.style.overflow = "hidden";
});

// Chức năng đăng ký
let signupButton = document.getElementById('signup-button');
signupButton.addEventListener('click', () => {
    event.preventDefault();
    let fullNameUser = document.getElementById('fullname').value;
    let phoneUser = document.getElementById('phone').value;
    let passwordUser = document.getElementById('password').value;
    let passwordConfirmation = document.getElementById('password_confirmation').value;
    let checkSignup = document.getElementById('checkbox-signup').checked;

    // Validate
    if (fullNameUser.length === 0) {
        document.querySelector('.form-message-name').innerHTML = 'Vui lòng nhập họ và tên';
        document.getElementById('fullname').focus();
    } else if (fullNameUser.length < 3) {
        document.getElementById('fullname').value = '';
        document.querySelector('.form-message-name').innerHTML = 'Vui lòng nhập họ và tên lớn hơn 3 kí tự';
    } else {
        document.querySelector('.form-message-name').innerHTML = '';
    }
    if (phoneUser.length === 0) {
        document.querySelector('.form-message-phone').innerHTML = 'Vui lòng nhập vào số điện thoại';
    } else if (phoneUser.length !== 10) {
        document.querySelector('.form-message-phone').innerHTML = 'Vui lòng nhập vào số điện thoại 10 số';
        document.getElementById('phone').value = '';
    } else {
        document.querySelector('.form-message-phone').innerHTML = '';
    }
    if (passwordUser.length === 0) {
        document.querySelector('.form-message-password').innerHTML = 'Vui lòng nhập mật khẩu';
    } else if (passwordUser.length < 6) {
        document.querySelector('.form-message-password').innerHTML = 'Vui lòng nhập mật khẩu lớn hơn 6 kí tự';
        document.getElementById('password').value = '';
    } else {
        document.querySelector('.form-message-password').innerHTML = '';
    }
    if (passwordConfirmation.length === 0) {
        document.querySelector('.form-message-password-confi').innerHTML = 'Vui lòng nhập lại mật khẩu';
    } else if (passwordConfirmation !== passwordUser) {
        document.querySelector('.form-message-password-confi').innerHTML = 'Mật khẩu không khớp';
        document.getElementById('password_confirmation').value = '';
    } else {
        document.querySelector('.form-message-password-confi').innerHTML = '';
    }
    if (!checkSignup) {
        document.querySelector('.form-message-checkbox').innerHTML = 'Vui lòng check đăng ký';
    } else {
        document.querySelector('.form-message-checkbox').innerHTML = '';
    }

    if (fullNameUser && phoneUser && passwordUser && passwordConfirmation && checkSignup) {
        if (passwordConfirmation === passwordUser) {
            let user = {
                fullname: fullNameUser,
                phone: phoneUser,
                password: passwordUser,
                address: '',
                email: '',
                status: 1,
                join: new Date(),
                cart: [],
                userType: 0
            };
            let accounts = JSON.parse(localStorage.getItem('accounts')) || [];
            let checkloop = accounts.some(account => account.phone === user.phone);
            console.log(accounts)
            console.log(checkloop)
            console.log(user)
            if (!checkloop) {
                accounts.push(user);
                localStorage.setItem('accounts', JSON.stringify(accounts));
                localStorage.setItem('currentuser', JSON.stringify(user));
                toast({ title: 'Thành công', message: 'Tạo thành công tài khoản!', type: 'success', duration: 3000 });
                closeModal();
                kiemtradangnhap();
                updateAmount();
            } else {
                toast({ title: 'Thất bại', message: 'Tài khoản đã tồn tại!', type: 'error', duration: 3000 });
            }
        } else {
            toast({ title: 'Thất bại', message: 'Sai mật khẩu!', type: 'error', duration: 3000 });
        }
    }
});

// Đăng nhập
let loginButton = document.getElementById('login-button');
loginButton.addEventListener('click', async () => {
    event.preventDefault();
    let phonelog = document.getElementById('phone-login').value;
    let passlog = document.getElementById('password-login').value;
    let accounts = JSON.parse(localStorage.getItem('accounts')) || [];

    if (phonelog.length === 0) {
        document.querySelector('.form-message.phonelog').innerHTML = 'Vui lòng nhập vào số điện thoại';
    } else if (phonelog.length !== 10) {
        document.querySelector('.form-message.phonelog').innerHTML = 'Vui lòng nhập vào số điện thoại 10 số';
        document.getElementById('phone-login').value = '';
    } else {
        document.querySelector('.form-message.phonelog').innerHTML = '';
    }
    if (passlog.length === 0) {
        document.querySelector('.form-message-check-login').innerHTML = 'Vui lòng nhập mật khẩu';
    } else if (passlog.length < 6) {
        document.querySelector('.form-message-check-login').innerHTML = 'Vui lòng nhập mật khẩu lớn hơn 6 kí tự';
        document.getElementById('password-login').value = '';
    } else {
        document.querySelector('.form-message-check-login').innerHTML = '';
    }

    if (phonelog && passlog) {
        let vitri = accounts.findIndex(item => item.phone === phonelog);
        if (vitri === -1) {
            toast({ title: 'Lỗi', message: 'Tài khoản của bạn không tồn tại', type: 'error', duration: 3000 });
        } else if (accounts[vitri].password === passlog) {
            if (accounts[vitri].status === 0) {
                toast({ title: 'Cảnh báo', message: 'Tài khoản của bạn đã bị khóa', type: 'warning', duration: 3000 });
            } else {
                localStorage.setItem('currentuser', JSON.stringify(accounts[vitri]));
                toast({ title: 'Thành công', message: 'Đăng nhập thành công', type: 'success', duration: 3000 });
                closeModal();
                kiemtradangnhap();
                checkAdmin();
                updateAmount();
                await retryFailedOrders(); // Thử đồng bộ các đơn hàng chưa gửi
            }
        } else {
            toast({ title: 'Cảnh báo', message: 'Sai mật khẩu', type: 'warning', duration: 3000 });
        }
    }
});

// Kiểm tra đăng nhập
function kiemtradangnhap() {
    let currentUser = localStorage.getItem('currentuser');
    if (currentUser) {
        let user = JSON.parse(currentUser);
        document.querySelector('.auth-container').innerHTML = `
            <span class="text-dndk">Tài khoản</span>
            <span class="text-tk">${user.fullname} <i class="fa-sharp fa-solid fa-caret-down"></span>`;
        document.querySelector('.header-middle-right-menu').innerHTML = `
            <li><a href="javascript:;" onclick="myAccount()"><i class="fa-solid fa-user"></i> Tài khoản của tôi</a></li>
            <li><a href="javascript:;" onclick="orderHistory()"><i class="fa-solid fa-bag-shopping"></i> Đơn hàng đã mua</a></li>
            <li class="border"><a id="logout" href="javascript:;"><i class="fa-solid fa-right-from-bracket"></i> Thoát tài khoản</a></li>`;
        document.querySelector('#logout').addEventListener('click', logOut);
    }
}

// Đăng xuất
function logOut() {
    let accounts = JSON.parse(localStorage.getItem('accounts'));
    let user = JSON.parse(localStorage.getItem('currentuser'));
    let vitri = accounts.findIndex(item => item.phone === user.phone);
    accounts[vitri].cart = user.cart;
    localStorage.setItem('accounts', JSON.stringify(accounts));
    localStorage.removeItem('currentuser');
    window.location = "/";
}

// Kiểm tra admin
function checkAdmin() {
    let user = JSON.parse(localStorage.getItem('currentuser'));
    if (user && user.userType === 1) {
        let node = document.createElement(`li`);
        node.innerHTML = `<a href="./admin.html"><i class="fa-light fa-gear"></i> Quản lý cửa hàng</a>`;
        document.querySelector('.header-middle-right-menu').prepend(node);
    }
}

// Chuyển đổi trang
function myAccount() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('trangchu').classList.add('hide');
    document.getElementById('order-history').classList.remove('open');
    document.getElementById('account-user').classList.add('open');
    userInfo();
}

function orderHistory() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('account-user').classList.remove('open');
    document.getElementById('trangchu').classList.add('hide');
    document.getElementById('order-history').classList.add('open');
    renderOrderProduct();
}

function renderOrderProduct() {
    const currentUser = JSON.parse(localStorage.getItem('currentuser'));
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const orderDetails = JSON.parse(localStorage.getItem('orderDetails') || '[]');
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const orderSection = document.querySelector('.order-history-section');
    orderSection.innerHTML = '';

    const userOrders = orders.filter(order => order.userId === currentUser.phone);

    if (userOrders.length === 0) {
        orderSection.innerHTML = `<p style="text-align:center">Bạn chưa có đơn hàng nào.</p>`;
        return;
    }

    userOrders.forEach(order => {
        const details = orderDetails.filter(item => item.madon === order.id);
        let html = `
            <div class="order-card">
                <h4>Đơn hàng: ${order.id}</h4>
                <p>Ngày đặt: ${formatDate(order.date)} | Tổng tiền: ${vnd(order.total)}</p>
                <ul class="order-items">
        `;

        details.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                html += `
                    <li>
                        <img src="${product.img}" alt="${product.title}" width="50" height="50">
                        <span>${product.title}</span>
                        <span>SL: ${item.soluong}</span>
                        <span>Ghi chú: ${item.note}</span>
                    </li>
                `;
            }
        });

        html += `</ul></div>`;
        orderSection.innerHTML += html;
    });
}


// Validate email
function emailIsValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Thông tin người dùng
function userInfo() {
    let user = JSON.parse(localStorage.getItem('currentuser'));
    document.getElementById('infoname').value = user.fullname;
    document.getElementById('infophone').value = user.phone;
    document.getElementById('infoemail').value = user.email || '';
    document.getElementById('infoaddress').value = user.address || '';
}

// Thay đổi thông tin
function changeInformation() {
    let accounts = JSON.parse(localStorage.getItem('accounts'));
    let user = JSON.parse(localStorage.getItem('currentuser'));
    let infoname = document.getElementById('infoname');
    let infoemail = document.getElementById('infoemail');
    let infoaddress = document.getElementById('infoaddress');

    user.fullname = infoname.value;
    if (infoemail.value.length > 0) {
        if (!emailIsValid(infoemail.value)) {
            document.querySelector('.inforemail-error').innerHTML = 'Vui lòng nhập lại email!';
            infoemail.value = '';
        } else {
            user.email = infoemail.value;
        }
    }
    if (infoaddress.value.length > 0) {
        user.address = infoaddress.value;
    }

    let vitri = accounts.findIndex(item => item.phone === user.phone);
    accounts[vitri].fullname = user.fullname;
    accounts[vitri].email = user.email;
    accounts[vitri].address = user.address;
    localStorage.setItem('currentuser', JSON.stringify(user));
    localStorage.setItem('accounts', JSON.stringify(accounts));
    kiemtradangnhap();
    toast({ title: 'Thành công', message: 'Cập nhật thông tin thành công!', type: 'success', duration: 3000 });
}

// Đổi mật khẩu
function changePassword() {
    let currentUser = JSON.parse(localStorage.getItem("currentuser"));
    let passwordCur = document.getElementById('password-cur-info');
    let passwordAfter = document.getElementById('password-after-info');
    let passwordConfirm = document.getElementById('password-comfirm-info');
    let check = true;

    if (passwordCur.value.length === 0) {
        document.querySelector('.password-cur-info-error').innerHTML = 'Vui lòng nhập mật khẩu hiện tại';
        check = false;
    } else {
        document.querySelector('.password-cur-info-error').innerHTML = '';
    }
    if (passwordAfter.value.length === 0) {
        document.querySelector('.password-after-info-error').innerHTML = 'Vui lòng nhập mật khẩu mới';
        check = false;
    } else {
        document.querySelector('.password-after-info-error').innerHTML = '';
    }
    if (passwordConfirm.value.length === 0) {
        document.querySelector('.password-after-comfirm-error').innerHTML = 'Vui lòng nhập mật khẩu xác nhận';
        check = false;
    } else {
        document.querySelector('.password-after-comfirm-error').innerHTML = '';
    }

    if (check) {
        if (passwordCur.value !== currentUser.password) {
            document.querySelector('.password-cur-info-error').innerHTML = 'Bạn đã nhập sai mật khẩu hiện tại';
        } else if (passwordAfter.value.length < 6) {
            document.querySelector('.password-after-info-error').innerHTML = 'Vui lòng nhập mật khẩu mới có số kí tự lớn hơn hoặc bằng 6';
        } else if (passwordConfirm.value !== passwordAfter.value) {
            document.querySelector('.password-after-comfirm-error').innerHTML = 'Mật khẩu bạn nhập không trùng khớp';
        } else {
            currentUser.password = passwordAfter.value;
            localStorage.setItem('currentuser', JSON.stringify(currentUser));
            let accounts = JSON.parse(localStorage.getItem('accounts'));
            let accountChange = accounts.find(acc => acc.phone === currentUser.phone);
            accountChange.password = currentUser.password;
            localStorage.setItem('accounts', JSON.stringify(accounts));
            toast({ title: 'Thành công', message: 'Đổi mật khẩu thành công!', type: 'success', duration: 3000 });
        }
    }
}

// Lấy thông tin sản phẩm
function getProductInfo(id) {
    let products = JSON.parse(localStorage.getItem('products')) || [];
    return products.find(item => item.id == id);
}

// Lấy chi tiết đơn hàng
function getOrderDetails(madon) {
    let orderDetails = JSON.parse(localStorage.getItem("orderDetails") || "[]");
    return orderDetails.filter(item => item.madon === madon);
}

// Định dạng ngày
function formatDate(date) {
    let fm = new Date(date);
    let yyyy = fm.getFullYear();
    let mm = fm.getMonth() + 1;
    let dd = fm.getDate();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    return dd + '/' + mm + '/' + yyyy;
}

// Tạo ID đơn hàng
function createId(arr) {
    let id = arr.length + 1;
    let check = arr.find(item => item.id === "DH" + id);
    while (check) {
        id++;
        check = arr.find(item => item.id === "DH" + id);
    }
    return "DH" + id;
}

// Trở lại đầu trang
window.onscroll = () => {
    let backtopTop = document.querySelector(".back-to-top");
    if (document.documentElement.scrollTop > 100) {
        backtopTop.classList.add("active");
    } else {
        backtopTop.classList.remove("active");
    }
};

// Ẩn tiêu đề khi cuộn
const headerNav = document.querySelector(".header-bottom");
let lastScrollY = window.scrollY;

window.addEventListener("scroll", () => {
    if (lastScrollY < window.scrollY) {
        headerNav.classList.add("hide");
    } else {
        headerNav.classList.remove("hide");
    }
    lastScrollY = window.scrollY;
});

// Hiển thị sản phẩm
function renderProducts(showProduct) {
    let productHtml = '';
    if (showProduct.length === 0) {
        document.getElementById("home-title").style.display = "none";
        productHtml = `
            <div class="no-result">
                <div class="no-result-h">Tìm kiếm không có kết quả</div>
                <div class="no-result-p">Xin lỗi, chúng tôi không thể tìm được kết quả hợp với tìm kiếm của bạn</div>
                <div class="no-result-i"><i class="fa-light fa-face-sad-cry"></i></div>
            </div>`;
    } else {
        document.getElementById("home-title").style.display = "block";
        showProduct.forEach((product) => {
            productHtml += `
                <div class="col-product">
                    <article class="card-product">
                        <div class="card-header">
                            <a href="#" class="card-image-link" onclick="detailProduct(${product.id})">
                                <img class="card-image" src="${product.img}" alt="${product.title}">
                            </a>
                        </div>
                        <div class="food-info">
                            <div class="card-content">
                                <div class="card-title">
                                    <a href="#" class="card-title-link" onclick="detailProduct(${product.id})">${product.title}</a>
                                </div>
                            </div>
                            <div class="card-footer">
                                <div class="product-price">
                                    <span class="current-price">${vnd(product.price)}</span>
                                </div>
                                <div class="product-buy">
                                    <button onclick="detailProduct(${product.id})" class="card-button order-item"><i class="fa-regular fa-cart-shopping-fast"></i> Đặt món</button>
                                </div>
                            </div>
                        </div>
                    </article>
                </div>`;
        });
    }
    document.getElementById('home-products').innerHTML = productHtml;
}

// Tìm kiếm sản phẩm
var productAll = JSON.parse(localStorage.getItem('products') || '[]').filter(item => item.status === 1);
function searchProducts(mode) {
    let valeSearchInput = document.querySelector('.form-search-input').value;
    let valueCategory = document.getElementById("advanced-search-category-select").value;
    let minPrice = document.getElementById("min-price").value;
    let maxPrice = document.getElementById("max-price").value;
    if (parseInt(minPrice) > parseInt(maxPrice) && minPrice !== "" && maxPrice !== "") {
        alert("Giá đã nhập sai!");
    }

    let result = valueCategory === "Tất cả" ? productAll : productAll.filter(item => item.category === valueCategory);
    result = valeSearchInput === "" ? result : result.filter(item => item.title.toUpperCase().includes(valeSearchInput.toUpperCase()));

    if (minPrice === "" && maxPrice !== "") {
        result = result.filter(item => item.price <= maxPrice);
    } else if (minPrice !== "" && maxPrice === "") {
        result = result.filter(item => item.price >= minPrice);
    } else if (minPrice !== "" && maxPrice !== "") {
        result = result.filter(item => item.price <= maxPrice && item.price >= minPrice);
    }

    document.getElementById("home-service").scrollIntoView();
    switch (mode) {
        case 0:
            result = JSON.parse(localStorage.getItem('products') || '[]');
            document.querySelector('.form-search-input').value = "";
            document.getElementById("advanced-search-category-select").value = "Tất cả";
            document.getElementById("min-price").value = "";
            document.getElementById("max-price").value = "";
            break;
        case 1:
            result.sort((a, b) => a.price - b.price);
            break;
        case 2:
            result.sort((a, b) => b.price - a.price);
            break;
    }
    showHomeProduct(result);
}

// Phân trang
let perPage = 12;
let currentPage = 1;

function displayList(productAll, perPage, currentPage) {
    let start = (currentPage - 1) * perPage;
    let end = (currentPage - 1) * perPage + perPage;
    let productShow = productAll.slice(start, end);
    renderProducts(productShow);
}

function showHomeProduct(products) {
    let productAll = products.filter(item => item.status === 1);
    displayList(productAll, perPage, currentPage);
    setupPagination(productAll, perPage, currentPage);
}

function setupPagination(productAll, perPage) {
    document.querySelector('.page-nav-list').innerHTML = '';
    let page_count = Math.ceil(productAll.length / perPage);
    for (let i = 1; i <= page_count; i++) {
        let li = paginationChange(i, productAll, currentPage);
        document.querySelector('.page-nav-list').appendChild(li);
    }
}

function paginationChange(page, productAll, currentPage) {
    let node = document.createElement(`li`);
    node.classList.add('page-nav-item');
    node.innerHTML = `<a href="javascript:;">${page}</a>`;
    if (currentPage === page) node.classList.add('active');
    node.addEventListener('click', function () {
        currentPage = page;
        displayList(productAll, perPage, currentPage);
        let t = document.querySelectorAll('.page-nav-item.active');
        for (let i = 0; i < t.length; i++) {
            t[i].classList.remove('active');
        }
        node.classList.add('active');
        document.getElementById("home-service").scrollIntoView();
    });
    return node;
}

// Hiển thị danh mục
function showCategory(category) {
    document.getElementById('trangchu').classList.remove('hide');
    document.getElementById('account-user').classList.remove('open');
    document.getElementById('order-history').classList.remove('open');
    let productSearch = productAll.filter(value => value.category.toUpperCase().includes(category.toUpperCase()));
    let currentPageSeach = 1;
    displayList(productSearch, perPage, currentPageSeach);
    setupPagination(productSearch, perPage, currentPageSeach);
    document.getElementById("home-title").scrollIntoView();
}

// Khởi tạo
window.onload = async function () {
    kiemtradangnhap();
    checkAdmin();
    updateAmount();
    updateCartTotal();
    await retryFailedOrders(); // Thử đồng bộ các đơn hàng chưa gửi khi tải trang

    // Kiểm tra trang hiện tại và đặt danh mục tương ứng
    const path = window.location.pathname;
    const categorySelect = document.querySelector('#advanced-search-category-select');

    if (path.includes('mon-chay.html')) {
        categorySelect.value = 'Món chay';
        searchProducts();
    } else if (path.includes('mon-man.html')) {
        categorySelect.value = 'Món mặn';
        searchProducts();
    } else if (path.includes('mon-lau.html')) {
        categorySelect.value = 'Món lẩu';
        searchProducts();
    } else if (path.includes('mon-trang-mieng.html')) {
        categorySelect.value = 'Món tráng miệng';
        searchProducts();
    } else if (path.includes('nuoc-uong.html')) {
        categorySelect.value = 'Nước uống';
        searchProducts();
    } else if (path.includes('mon-an-vat.html')) {
        categorySelect.value = 'Món ăn vặt';
        searchProducts();
    } else {
        // Hiển thị tất cả sản phẩm cho các trang khác (ví dụ: index.html)
        showHomeProduct(JSON.parse(localStorage.getItem('products') || '[]'));
    }
};

document.getElementById('confirm-checkout').addEventListener('click', () => {
    const name = document.getElementById('checkout-name').value.trim();
    const address = document.getElementById('checkout-address').value.trim();

    if (!name || !address) {
        toast({ title: 'Lỗi', message: 'Vui lòng nhập đầy đủ họ tên và địa chỉ!', type: 'error', duration: 3000 });
        return;
    }

    let currentUser = JSON.parse(localStorage.getItem('currentuser'));
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    let orderDetails = JSON.parse(localStorage.getItem('orderDetails') || '[]');

    let orderItems = [];
    let isBuyNow = false;

    const buyNowTemp = JSON.parse(sessionStorage.getItem('buyNowTemp') || 'null');

    if (buyNowTemp) {
        isBuyNow = true;
        orderItems = [{
            id: buyNowTemp.id,
            soluong: buyNowTemp.soluong,
            note: buyNowTemp.note
        }];
    } else {
        orderItems = currentUser.cart;
    }

    let order = {
        id: createId(orders),
        userId: currentUser.phone,
        name: name,
        address: address,
        items: orderItems,
        total: orderItems.reduce((sum, item) => sum + item.soluong * getProductInfo(item.id).price, 0),
        status: 'fake-paid',
        date: new Date().toISOString()
    };

    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    orderItems.forEach(item => {
        orderDetails.push({
            madon: order.id,
            productId: item.id,
            soluong: item.soluong,
            note: item.note
        });
    });
    localStorage.setItem('orderDetails', JSON.stringify(orderDetails));

    // Dọn dẹp sau khi đặt
    if (isBuyNow) {
        sessionStorage.removeItem('buyNowTemp');
    } else {
        currentUser.cart = [];
        localStorage.setItem('currentuser', JSON.stringify(currentUser));
    }

    updateAmount();
    updateCartTotal();
    closeCart();
    closeModal();

    toast({ title: 'Thành công', message: 'Đặt hàng thành công!', type: 'success', duration: 3000 });
});

