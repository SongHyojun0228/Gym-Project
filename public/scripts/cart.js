// ✅ 장바구니에 담기 ✅
document.addEventListener("DOMContentLoaded", function () {
    const cartBtn = document.getElementById("cart-btn");
    cartBtn.addEventListener("click", function (event) {
        event.preventDefault();

        const productId = cartBtn.dataset.productId;
        console.log("클라이언트에서 보낼 productId:", productId);

        if (!productId) {
            alert("상품 ID가 없습니다!");
            return;
        }

        fetch("/add-to-cart", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ productId }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("서버 응답:", data);
                if (data.success) {
                    alert("장바구니에 추가되었습니다.");
                } else {
                    alert("잠시 후 다시 시도해주세요.");
                }
            })
            .cㄹatch((error) => console.error("Error:", error));
    });
});

// ✅ 장바구니 상품 개수 수정 ✅
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".plus-btn, .minus-btn").forEach((button) => {
        button.addEventListener("click", function () {
            const productId = this.dataset.productId;
            const inputField = document.querySelector(`.product-amount[data-product-id="${productId}"]`);
            let currentAmount = parseInt(inputField.value);

            if (this.classList.contains("plus-btn")) {
                currentAmount++;
            } else if (this.classList.contains("minus-btn") && currentAmount > 1) {
                currentAmount--;
            }

            inputField.value = currentAmount;
            updateCart(productId, currentAmount);
        });
    });

    document.querySelectorAll(".product-amount").forEach((inputField) => {
        inputField.addEventListener("change", function () {
            const productId = this.dataset.productId;
            let newAmount = parseInt(this.value);

            if (isNaN(newAmount) || newAmount < 1) {
                newAmount = 1;
                this.value = newAmount;
            }

            updateCart(productId, newAmount);
        });
    });
});

// ✅ 장바구니 상품 수정 ✅
function updateCart(productId, amount) {
    fetch("/update-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, amount }),
    })
        .then(response => response.json())
        .then(data => {
            console.log("서버 응답 데이터:", data);

            if (data.success) {
                document.getElementById("total-amount").innerText = `총 ${data.cartTotalAmount.toLocaleString()}개`;
                document.getElementById("total-price").innerText = `${data.totalPrice.toLocaleString()}원`;

                const productPriceElement = document.querySelector(`.product-price[data-product-id="${productId}"]`);
                if (productPriceElement) {
                    productPriceElement.innerText = `${data.updatedPrice.toLocaleString()}원`;
                }
            } else {
                alert("수량 변경 중 오류가 발생했습니다.");
            }
        })
        .catch(error => console.error("Error:", error));
}


// ✅ 장바구니 상품 삭제 ✅
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", function (event) {
            event.preventDefault(); // 기본 동작(페이지 이동) 막기

            const productId = this.dataset.productId;

            fetch("/delete-cart-item", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert("상품이 장바구니에서 삭제되었습니다.");

                        const cartItem = document.querySelector(`.cart-item [data-product-id="${productId}"]`)?.closest(".cart-item");
                        if (cartItem) {
                            cartItem.remove();
                        }

                        const totalAmountEl = document.getElementById("total-amount");
                        const totalPriceEl = document.getElementById("total-price");

                        if (totalAmountEl) {
                            totalAmountEl.innerText = `총 ${data.cartTotalAmount.toLocaleString()}개`;
                        }
                        if (totalPriceEl) {
                            totalPriceEl.innerText = `${data.totalPrice.toLocaleString()}원`;
                        }
                        
                        if (data.cartTotalAmount === 0) {
                            document.getElementById("total").innerHTML = '<p id="empty-cart">장바구니가 비어있습니다.</p>';
                        }
                    } else {
                        alert("삭제 실패: " + data.message);
                    }
                })
                .catch(error => console.error("Error:", error));
        });
    });
});


