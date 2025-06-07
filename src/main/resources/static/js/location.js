document.addEventListener('DOMContentLoaded', function () {
    const mapContainer = document.getElementById('map');
    const mapOption = {
        center: new kakao.maps.LatLng(37.5665, 126.9780),
        level: 3
    };
    const map = new kakao.maps.Map(mapContainer, mapOption);
    const places = new kakao.maps.services.Places();

    const markerMap = new Map(); // loc.id → { marker, infowindow }

    const csrfToken = document.querySelector('meta[name="_csrf"]')?.getAttribute('content');
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.getAttribute('content');

    if (window.visitedLocations && Array.isArray(window.visitedLocations)) {
        addMarkers(window.visitedLocations, map, markerMap);
    }

    document.getElementById('location-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = new FormData(e.target);

        if (csrfToken && csrfHeader) {
            formData.append(csrfHeader, csrfToken);
        }

        const loadingBar = document.getElementById('loading-bar-overlay');

        loadingBar.style.display = 'block'; // 로딩바 보이기

        fetch('/api/locations', {
            method: 'POST',
            body: formData
        }).then(res => {
            loadingBar.style.display = 'none'; // 로딩바 숨기기
            if (res.ok) {
                alert('저장되었습니다!');
                hideForm();
                location.reload();
            } else {
                alert('저장 실패');
            }
        }).catch(() => {
            loadingBar.style.display = 'none'; // 에러 시에도 숨기기
            alert('저장 실패');
        });
    });

    // 마커 표시 함수 (마커, 인포윈도우 저장)
    function addMarkers(locations, map, markerMap) {
        let openInfoWindow = null;

        locations.forEach(loc => {
            if (loc.latitude && loc.longitude) {
                const position = new kakao.maps.LatLng(loc.latitude, loc.longitude);

                const marker = new kakao.maps.Marker({
                    map: map,
                    position: position
                });

                const iwContent = `<div style="padding:5px;font-size:13px;">
                    <b>${loc.name}</b><br>
                    ${loc.address ? loc.address + '<br>' : ''}
                    ${loc.visitedDate ? '방문일: ' + loc.visitedDate + '<br>' : ''}
                    ${loc.memo ? '메모: ' + loc.memo : ''}
                </div>`;

                const infowindow = new kakao.maps.InfoWindow({ content: iwContent });

                kakao.maps.event.addListener(marker, 'click', function () {
                    if (openInfoWindow) openInfoWindow.close();
                    infowindow.open(map, marker);
                    openInfoWindow = infowindow;
                });

                kakao.maps.event.addListener(infowindow, 'close', function () {
                    if (openInfoWindow === infowindow) openInfoWindow = null;
                });

                markerMap.set(loc.id.toString(), { marker, infowindow });
            }
        });
    }

    // 썸네일 클릭 핸들러에 마커 중심 이동 및 InfoWindow 열기 추가
    window.onThumbClick = function (elem) {
        const locId = elem.getAttribute('data-loc-id');
        const imageUrl = elem.getAttribute('data-img-url');
        changeMainImage(locId, imageUrl, elem);

        // 모든 InfoWindow 닫기
        markerMap.forEach(({ infowindow }) => {
            infowindow.close();
        });

        const markerData = markerMap.get(locId);
        if (markerData) {
            const { marker, infowindow } = markerData;
            map.setCenter(marker.getPosition());
            infowindow.open(map, marker);
        }
    };

    document.addEventListener('click', async function(e) {
        if (e.target.classList.contains('delete-btn')) {
            const locId = e.target.getAttribute('data-loc-id');
            if (!locId) return;

            if (confirm('이 장소를 정말 삭제하시겠습니까?')) {
                try {
                    const headers = {};
                    if (csrfToken && csrfHeader) headers[csrfHeader] = csrfToken;
                    const res = await fetch(`/api/locations/${locId}`, {
                                        method: 'DELETE',
                                        headers
                                    });
                    if (res.ok) {
                        alert('삭제되었습니다.')
                        // 카드 DOM에서 삭제
                        const card = e.target.closest('.location');
                        if (card) card.remove();
                    } else {
                        alert('삭제에 실패했습니다.');
                    }
                } catch (err) {
                    alert('네트워크 오류로 삭제에 실패했습니다.');
                }
            }
        }
    });
});

// 기타 함수 그대로 유지
function searchDetailAddressFromCoords(coords) {
    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.coord2Address(coords.getLng(), coords.getLat(), function (result, status) {
        if (status === kakao.maps.services.Status.OK) {
            const address = result[0].road_address?.address_name || result[0].address.address_name;
            document.querySelector('input[name="address"]').value = address;
        }
    });
}

function searchNearbyPlace(coords, places) {
    const options = { location: coords, radius: 50 };
    places.keywordSearch('', function (result, status) {
        if (status === kakao.maps.services.Status.OK && result.length > 0) {
            document.querySelector('input[name="name"]').value = result[0].place_name;
        }
    }, options);
}

function showForm() {
    document.getElementById('form-popup').classList.add('show');
}

function hideForm() {
    document.getElementById('form-popup').classList.remove('show');
}

function searchKakaoPlace() {
    const keyword = document.getElementById('kakao-search-keyword').value.trim();
    if (!keyword) {
        alert('검색어를 입력하세요.');
        return;
    }

    const ps = new kakao.maps.services.Places();
    ps.keywordSearch(keyword, function (data, status) {
        const resultsDiv = document.getElementById('kakao-search-results');
        resultsDiv.innerHTML = '';
        if (status === kakao.maps.services.Status.OK && data.length > 0) {
            data.forEach(place => {
                const div = document.createElement('div');
                div.className = 'kakao-result-item';
                div.textContent = `${place.place_name} - ${place.road_address_name || place.address_name}`;
                div.style.cursor = 'pointer';
                div.style.padding = '6px 0';
                div.onclick = function () {
                    document.getElementById('place-name').value = place.place_name;
                    document.getElementById('place-address').value = place.road_address_name || place.address_name;
                    document.getElementById('latitude').value = place.y;
                    document.getElementById('longitude').value = place.x;
                    resultsDiv.innerHTML = '';
                };
                resultsDiv.appendChild(div);
            });
        } else {
            resultsDiv.innerHTML = '<div style="color:#999;">검색 결과가 없습니다.</div>';
        }
    });
}

function changeMainImage(locId, imageUrl, thumbElem) {
    const mainImg = document.getElementById('main-image-' + locId);
    if (mainImg) mainImg.src = imageUrl;

    const thumbList = thumbElem.parentNode.querySelectorAll('.location-thumb-image');
    thumbList.forEach(img => img.classList.remove('active'));
    thumbElem.classList.add('active');
}

// 🔄 썸네일 클릭 시 메인 이미지 변경
function onThumbClick(thumb) {
    const newImageUrl = thumb.dataset.imgUrl;
    const locId = thumb.dataset.locId;
    const mainImage = document.getElementById(`main-image-${locId}`);

    if (mainImage && newImageUrl) {
        mainImage.src = newImageUrl;

        // 현재 선택된 썸네일 표시 (선택 효과용)
        const allThumbs = thumb.parentElement.querySelectorAll('.location-thumb-image');
        allThumbs.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
    }
}

// ⬅➡ 메인 이미지 좌우 화살표 클릭 시
function changeMainImageByArrow(buttonElement, direction) {
    const mainWrapper = buttonElement.closest(".main-image-wrapper");
    const mainImg = mainWrapper.querySelector(".location-main-image");
    const locId = mainImg.getAttribute("data-loc-id");

    const thumbStrip = document.getElementById(`thumb-strip-${locId}`);
    if (!thumbStrip) return;

    const thumbs = Array.from(thumbStrip.querySelectorAll(".location-thumb-image"));
    const currentMainUrl = mainImg.src;

    // src 비교 시 절대경로/상대경로 문제 방지
    let currentIndex = thumbs.findIndex(img => img.src === currentMainUrl || img.getAttribute('src') === currentMainUrl);
    if (currentIndex === -1) currentIndex = 0;

    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = thumbs.length - 1;
    if (newIndex >= thumbs.length) newIndex = 0;

    const newThumb = thumbs[newIndex];
    onThumbClick(newThumb);

    // 썸네일 자동 스크롤 포커싱
    const visibleCount = 5; // 한 번에 보이는 썸네일 개수
    // 실제 썸네일 width+margin-right 값을 구함
    const thumbStyle = getComputedStyle(newThumb);
    const thumbWidth = newThumb.offsetWidth + parseInt(thumbStyle.marginRight || 0, 10);

    // thumbIndexes[locId]가 undefined일 때 0으로 초기화
    if (typeof thumbIndexes[locId] !== 'number') thumbIndexes[locId] = 0;

    // 현재 썸네일 strip의 시작 인덱스
    let start = thumbIndexes[locId];
    let end = start + visibleCount - 1;

    // 만약 newIndex가 strip 범위 밖이면 strip 이동
    if (newIndex < start) {
        thumbIndexes[locId] = newIndex;
    } else if (newIndex > end) {
        thumbIndexes[locId] = newIndex - visibleCount + 1;
    }
    // 최대 범위 체크
    const maxIndex = Math.max(0, thumbs.length - visibleCount);
    if (thumbIndexes[locId] > maxIndex) thumbIndexes[locId] = maxIndex;
    if (thumbIndexes[locId] < 0) thumbIndexes[locId] = 0;

    const offset = thumbIndexes[locId] * thumbWidth;
    thumbStrip.style.transform = `translateX(-${offset}px)`;
}


// ↔ 썸네일 가로 스크롤 버튼
const thumbIndexes = {}; // 썸네일 위치 기억

function scrollThumbnails(button, direction) {
    const wrapper = button.closest('.thumbnail-wrapper');
    const strip = wrapper.querySelector('.location-thumbnails');
    const locId = strip.dataset.locId;
    const thumbnails = strip.querySelectorAll('.location-thumb-image');

    const visibleCount = 5;
    const thumbWidth = 60 + 10; // 이미지 width + margin-right
    const maxIndex = Math.max(0, thumbnails.length - visibleCount);

    if (!thumbIndexes[locId]) {
        thumbIndexes[locId] = 0;
    }

    let index = thumbIndexes[locId];

    if (direction === 1 && index < maxIndex) {
        index++;
    } else if (direction === -1 && index > 0) {
        index--;
    }

    thumbIndexes[locId] = index;
    const offset = index * thumbWidth;
    strip.style.transform = `translateX(-${offset}px)`;
}