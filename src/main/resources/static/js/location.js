document.addEventListener('DOMContentLoaded', function() {
    const mapContainer = document.getElementById('map');
    const mapOption = {
        center: new kakao.maps.LatLng(37.5665, 126.9780),
        level: 3
    };
    const map = new kakao.maps.Map(mapContainer, mapOption);
    const places = new kakao.maps.services.Places();

    // 방문한 장소 마커 표시 (SSR 방식)
    if (window.visitedLocations && Array.isArray(window.visitedLocations)) {
        addMarkers(window.visitedLocations, map);
    }

    // REST 방식으로 마커 표시 (만약 SSR이 아니라면)
    // fetch('/api/locations').then(res => res.json()).then(locations => addMarkers(locations, map));

    // 지도 클릭 시 장소 추가 폼
//    kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
//        const latlng = mouseEvent.latLng;
//        const lat = latlng.getLat();
//        const lng = latlng.getLng();
//
//        const coord = new kakao.maps.LatLng(lat, lng);
//        searchDetailAddressFromCoords(coord);
//        searchNearbyPlace(coord, places);
//
//        document.querySelector('input[name="latitude"]').value = lat;
//        document.querySelector('input[name="longitude"]').value = lng;
//
//        showForm();
//    });

    // CSRF 토큰 읽기
    function getCsrfToken() {
        const token = document.querySelector('meta[name="_csrf"]')?.getAttribute('content');
        const header = document.querySelector('meta[name="_csrf_header"]')?.getAttribute('content');
        return { token, header };
    }
    // 장소 등록 폼 제출
    document.getElementById('location-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(e.target);

        // CSRF 토큰이 있다면 FormData에 추가
        const csrfToken = document.querySelector('meta[name="_csrf"]')?.getAttribute('content');
        const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.getAttribute('content');
        if (csrfToken && csrfHeader) {
            formData.append(csrfHeader, csrfToken);
        }

        fetch('/api/locations', {
            method: 'POST',
            body: formData // Content-Type을 명시하지 말 것!
        }).then(res => {
            if (res.ok) {
                alert('저장되었습니다!');
                hideForm();
                location.reload();
            } else {
                alert('저장 실패');
            }
        });
    });

});

// 마커 표시 함수
function addMarkers(locations, map) {
    let openInfoWindow = null; // 현재 열려있는 InfoWindow를 추적

    locations.forEach(loc => {
        if (loc.latitude && loc.longitude) {
            const marker = new kakao.maps.Marker({
                map: map,
                position: new kakao.maps.LatLng(loc.latitude, loc.longitude)
            });

            const iwContent = `<div style="padding:5px;font-size:13px;position:relative;">
                <b>${loc.name}</b><br>
                ${loc.address ? loc.address + '<br>' : ''}
                ${loc.visitedDate ? '방문일: ' + loc.visitedDate + '<br>' : ''}
                ${loc.memo ? '메모: ' + loc.memo : ''}
            </div>`;

            const infowindow = new kakao.maps.InfoWindow({content: iwContent});

            // InfoWindow 닫기 함수 등록 (X버튼에서 사용)
            infowindow.setContent = function(content) {
                kakao.maps.InfoWindow.prototype.setContent.call(this, content);
                // InfoWindow DOM이 렌더링된 후에 X버튼에 닫기 함수 연결
                setTimeout(() => {
                    const infoDiv = document.querySelector('.info-window-content');
                    if (infoDiv) {
                        infoDiv.__closeInfoWindow = () => this.close();
                    }
                }, 10);
            };

            // 마커 클릭 시 InfoWindow 토글
            kakao.maps.event.addListener(marker, 'click', function() {
                // 이미 열려있는 InfoWindow가 이 마커의 것이라면 닫기
                if (openInfoWindow === infowindow) {
                    infowindow.close();
                    openInfoWindow = null;
                } else {
                    // 다른 InfoWindow가 열려있으면 닫기
                    if (openInfoWindow) openInfoWindow.close();
                    infowindow.open(map, marker);
                    openInfoWindow = infowindow;
                }
            });

            // InfoWindow가 닫힐 때 상태 초기화
            kakao.maps.event.addListener(infowindow, 'close', function() {
                if (openInfoWindow === infowindow) openInfoWindow = null;
            });
        }
    });
}


function searchDetailAddressFromCoords(coords) {
    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.coord2Address(coords.getLng(), coords.getLat(), function(result, status) {
        if (status === kakao.maps.services.Status.OK) {
            const address = result[0].road_address?.address_name || result[0].address.address_name;
            document.querySelector('input[name="address"]').value = address;
        } else {
            console.warn("정확한 주소를 찾을 수 없습니다.");
        }
    });
}

function searchNearbyPlace(coords, places) {
    const options = {
        location: coords,
        radius: 50
    };

    places.keywordSearch('', function(result, status) {
        if (status === kakao.maps.services.Status.OK && result.length > 0) {
            document.querySelector('input[name="name"]').value = result[0].place_name;
        } else {
            console.warn("장소명을 찾을 수 없습니다.");
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

    // Kakao Places API 객체 생성 (카카오맵 SDK가 이미 로드되어 있어야 함)
    const ps = new kakao.maps.services.Places();

    ps.keywordSearch(keyword, function(data, status) {
        const resultsDiv = document.getElementById('kakao-search-results');
        resultsDiv.innerHTML = '';
        if (status === kakao.maps.services.Status.OK && data.length > 0) {
            data.forEach(place => {
                const div = document.createElement('div');
                div.className = 'kakao-result-item';
                div.textContent = `${place.place_name} - ${place.road_address_name || place.address_name}`;
                div.style.cursor = 'pointer';
                div.style.padding = '6px 0';
                div.onclick = function() {
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
function onThumbClick(elem) {
    const locId = elem.getAttribute('data-loc-id');
    const imageUrl = elem.getAttribute('data-img-url');
    changeMainImage(locId, imageUrl, elem);
}

function changeMainImage(locId, imageUrl, thumbElem) {
    // 메인 이미지 변경
    const mainImg = document.getElementById('main-image-' + locId);
    if (mainImg) mainImg.src = imageUrl;

    // 썸네일 active 효과
    const thumbList = thumbElem.parentNode.querySelectorAll('.location-thumb-image');
    thumbList.forEach(img => img.classList.remove('active'));
    thumbElem.classList.add('active');
}
