/* 아래 코드처럼 테마 객체를 생성합니다.(color값은 #F00, #FF0000 형식으로 입력하세요.)
변경되지 않는 색상의 경우 주석 또는 제거하시거나 값을 공백으로 하시면 됩니다. */

var themeObj = {
    bgColor: "#0F0F0F", //바탕 배경색
    searchBgColor: "#F0F0F0", //검색창 배경색
    contentBgColor: "#F0F0F0", //본문 배경색(검색결과,결과없음,첫화면,검색서제스트)
    pageBgColor: "#982932", //페이지 배경색
    textColor: "#0F0F0F", //기본 글자색
    queryTextColor: "#0F0F0F", //검색창 글자색
    postcodeTextColor: "#982932", //우편번호 글자색
    //emphTextColor: "", //강조 글자색
    outlineColor: "#3F3F3F" //테두리
};

/* 위에서 생성한 themeObj객체를 우편번호 서비스 생성자에 넣습니다.
생성자의 자세한 설정은 예제 및 속성탭을 확인해 주세요. */
/*
new daum.Postcode({
   theme: themeObj
}).open();
 
new daum.Postcode({
   theme: themeObj
}).embed(target);
*/

function user_execDaumPostcode() {
    new daum.Postcode({
        oncomplete: function (data) {
            // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분.

            // 각 주소의 노출 규칙에 따라 주소를 조합한다.
            // 내려오는 변수가 값이 없는 경우엔 공백('')값을 가지므로, 이를 참고하여 분기 한다.
            var addr = ""; // 주소 변수
            var extraAddr = ""; // 참고항목 변수

            //사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
            if (data.userSelectedType === "R") {
                // 사용자가 도로명 주소를 선택했을 경우
                addr = data.roadAddress;
            } else {
                // 사용자가 지번 주소를 선택했을 경우(J)
                addr = data.jibunAddress;
            }

            // 사용자가 선택한 주소가 도로명 타입일때 참고항목을 조합한다.
            if (data.userSelectedType === "R") {
                // 법정동명이 있을 경우 추가한다. (법정리는 제외)
                // 법정동의 경우 마지막 문자가 "동/로/가"로 끝난다.
                if (data.bname !== "" && /[동|로|가]$/g.test(data.bname)) {
                    extraAddr += data.bname;
                }
                // 건물명이 있고, 공동주택일 경우 추가한다.
                if (data.buildingName !== "" && data.apartment === "Y") {
                    extraAddr +=
                        extraAddr !== "" ? ", " + data.buildingName : data.buildingName;
                }
                // 표시할 참고항목이 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
                if (extraAddr !== "") {
                    extraAddr = " (" + extraAddr + ")";
                }
                // 조합된 참고항목을 해당 필드에 넣는다.
                document.getElementById("user_extraAddress").value = extraAddr;
            } else {
                document.getElementById("user_extraAddress").value = "";
            }

            // 우편번호와 주소 정보를 해당 필드에 넣는다.
            document.getElementById("user_postcode").value = data.zonecode;
            document.getElementById("user_address").value = addr;
            // 커서를 상세주소 필드로 이동한다.
            document.getElementById("user_detailAddress").focus();
        },
    }).open();
}