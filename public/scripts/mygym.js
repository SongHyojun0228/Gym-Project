document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', function() {
        document.getElementById('delete-check-overlay').style.display = 'block';
    });
});


document.getElementById('cancel-btn').addEventListener('click', function() {
    document.getElementById('delete-check-overlay').style.display = 'none';
});

document.getElementById('confirm-delete-btn').addEventListener('click', function () {
    const gymId = document.querySelector('.gyms-container a').href.split('/').pop(); 
  
    fetch(`/mygym/${gymId}/delete`, {
      method: 'POST',
    })
      .then((response) => {
        if (response.ok) {
          alert('삭제를 완료했습니다.');
          location.reload();
        } else {
          alert('삭제하는 데에 실패했습니다. 다시 시도해주세요');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('오류가 발생했습니다.');
      });
  
    document.getElementById('delete-check-overlay').style.display = 'none';
  });