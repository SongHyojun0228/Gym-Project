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
            .catch((error) => console.error("Error:", error));
    });
});
