document.addEventListener('DOMContentLoaded', function() {
    let usernameChecked = false;

    const usernameInput = document.getElementById('username');
    const checkBtn = document.getElementById('check-username-btn');
    const resultSpan = document.getElementById('username-check-result');
    const signupForm = document.querySelector('form');
    const submitBtn = signupForm.querySelector('button[type="submit"]');

    const passwordInput = document.getElementById('password');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');
    const addressDetailInput = document.getElementById('addressDetail');

    // 아이디 입력 시 중복확인 상태 초기화
    usernameInput.addEventListener('input', function() {
        usernameChecked = false;
        resultSpan.textContent = '';
    });

    // 아이디 중복확인
    checkBtn.addEventListener('click', function() {
        const username = usernameInput.value.trim();
        if (!username) {
            alert('아이디를 입력하세요.');
            return;
        }
        fetch(`/api/check-username?username=${encodeURIComponent(username)}`)
            .then(res => res.json())
            .then(isDuplicated => {
                if (isDuplicated) {
                    resultSpan.textContent = '이미 사용 중인 아이디입니다.';
                    resultSpan.style.color = 'red';
                    usernameChecked = false;
                } else {
                    resultSpan.textContent = '사용 가능한 아이디입니다.';
                    resultSpan.style.color = 'green';
                    usernameChecked = true;
                }
            });
    });

    // 폼 제출 시 모든 필수 입력값/중복확인 체크
    signupForm.addEventListener('submit', function(e) {
        // 필수 입력값 체크
        if (!usernameInput.value.trim()) {
            alert('아이디를 입력하세요.');
            usernameInput.focus();
            e.preventDefault();
            return;
        }
        if (!usernameChecked) {
            alert('아이디 중복확인을 해주세요.');
            usernameInput.focus();
            e.preventDefault();
            return;
        }
        if (!passwordInput.value.trim()) {
            alert('비밀번호를 입력하세요.');
            passwordInput.focus();
            e.preventDefault();
            return;
        }
        if (!emailInput.value.trim()) {
            alert('이메일을 입력하세요.');
            emailInput.focus();
            e.preventDefault();
            return;
        }
        if (!phoneInput.value.trim()) {
            alert('핸드폰번호를 입력하세요.');
            phoneInput.focus();
            e.preventDefault();
            return;
        }
        if (!addressInput.value.trim()) {
            alert('주소를 검색해서 입력하세요.');
            addressInput.focus();
            e.preventDefault();
            return;
        }
        // 주소와 상세주소 합쳐서 address에 저장
        if (addressDetailInput.value.trim()) {
            addressInput.value = addressInput.value.trim() + ' ' + addressDetailInput.value.trim();
        }
        // (상세주소가 비어있으면 그냥 addressInput.value만 전송)
        // 추천인은 필수가 아니므로 체크하지 않음
    });
});

// 카카오 주소검색 API는 전역에 선언!
function execDaumPostcode() {
    new daum.Postcode({
        oncomplete: function(data) {
            document.getElementById('address').value = data.address;
        }
    }).open();
}
