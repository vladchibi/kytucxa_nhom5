// Khi bấm nút "Chỉnh sửa"
document.querySelector(".profile-header button").addEventListener("click", () => {
  document.getElementById("editForm").style.display = "block";

  // Lấy dữ liệu hiện tại để fill vào form
  document.getElementById("editFullName").value = document.querySelector(".profile-body div:nth-child(1)").innerText.replace("Họ và tên: ", "");
  document.getElementById("editEmail").value = document.querySelector(".profile-body div:nth-child(2)").innerText.replace("Email: ", "");
  document.getElementById("editPhone").value = document.querySelector(".profile-body div:nth-child(3)").innerText.replace("SĐT: ", "");
  document.getElementById("editDob").value = "2004-01-01"; // tạm fix, vì text -> date cần xử lý thêm
  document.getElementById("editCccd").value = document.querySelector(".profile-body div:nth-child(5)").innerText.replace("CCCD: ", "");
  document.getElementById("editGender").value = document.querySelector(".profile-body div:nth-child(6)").innerText.replace("Giới tính: ", "");
  document.getElementById("editRoom").value = document.querySelector(".profile-body div:nth-child(7)").innerText.replace("Phòng: ", "");
  document.getElementById("editStatus").value = document.querySelector(".profile-body div:nth-child(8)").innerText.replace("Trạng thái: ", "");
});

// Hàm lưu thông tin
function saveProfile() {
  // Lấy dữ liệu mới từ form
  const fullName = document.getElementById("editFullName").value;
  const email = document.getElementById("editEmail").value;
  const phone = document.getElementById("editPhone").value;
  const dob = document.getElementById("editDob").value;
  const cccd = document.getElementById("editCccd").value;
  const gender = document.getElementById("editGender").value;
  const room = document.getElementById("editRoom").value;
  const status = document.getElementById("editStatus").value;

  // Cập nhật lại giao diện
  document.querySelector(".profile-header .info h3").innerText = fullName;
  document.querySelector(".profile-header .info p").innerText = email;

  document.querySelector(".profile-body div:nth-child(1)").innerHTML = "<strong>Họ và tên:</strong> " + fullName;
  document.querySelector(".profile-body div:nth-child(2)").innerHTML = "<strong>Email:</strong> " + email;
  document.querySelector(".profile-body div:nth-child(3)").innerHTML = "<strong>SĐT:</strong> " + phone;
  document.querySelector(".profile-body div:nth-child(4)").innerHTML = "<strong>Ngày sinh:</strong> " + dob;
  document.querySelector(".profile-body div:nth-child(5)").innerHTML = "<strong>CCCD:</strong> " + cccd;
  document.querySelector(".profile-body div:nth-child(6)").innerHTML = "<strong>Giới tính:</strong> " + gender;
  document.querySelector(".profile-body div:nth-child(7)").innerHTML = "<strong>Phòng:</strong> " + room;
  document.querySelector(".profile-body div:nth-child(8)").innerHTML = "<strong>Trạng thái:</strong> " + status;

  alert("Cập nhật thành công");

  // Ẩn form sau khi cập nhật
  document.getElementById("editForm").style.display = "none";
}
