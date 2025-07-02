// 1. Hiệu ứng ẩn/hiện header khi cuộn
let lastScrollY = window.scrollY;
const header = document.querySelector("header");

window.addEventListener("scroll", () => {
  if (window.scrollY > lastScrollY) {
    header.style.transform = "translateY(-100%)";
  } else {
    header.style.transform = "translateY(0)";
  }
  lastScrollY = window.scrollY;
});

// 2. Slide Gallery (nếu có class "slider")
const sliders = document.querySelectorAll(".slider");
sliders.forEach(slider => {
  const images = slider.querySelectorAll("img");
  let index = 0;

  setInterval(() => {
    images.forEach((img, i) => {
      img.style.display = i === index ? "block" : "none";
    });
    index = (index + 1) % images.length;
  }, 3000);
});

// 3. Form validation cho form tạo tranh (nếu có)
document.addEventListener("DOMContentLoaded", () => {
  const tranhForm = document.querySelector("#taoTranhForm");
  if (tranhForm) {
    tranhForm.addEventListener("submit", (e) => {
      const name = tranhForm.querySelector("input[name='tenTranh']");
      const desc = tranhForm.querySelector("textarea[name='moTa']");
      let isValid = true;

      if (!name.value.trim()) {
        alert("Vui lòng nhập tên tranh.");
        name.focus();
        isValid = false;
      } else if (!desc.value.trim()) {
        alert("Vui lòng nhập mô tả.");
        desc.focus();
        isValid = false;
      }

      if (!isValid) {
        e.preventDefault();
      }
    });
  }

  // 4. Tải và hiển thị ảnh đã duyệt
  const gallery = document.getElementById("approved-gallery");
  if (gallery) {
    fetch('/approved-images')
      .then(res => res.json())
      .then(images => {
        if (!images.length) {
          gallery.innerHTML = '<p>Chưa có tranh nào được duyệt.</p>';
          return;
        }
        images.forEach(url => {
          const card = document.createElement('div');
          card.className = 'ai-card';
          card.innerHTML = `<img src="${url}" alt="Tranh đã duyệt" style="width:100%; border-radius:10px;">`;
          gallery.appendChild(card);
        });
      })
      .catch(err => {
        console.error('Lỗi khi tải ảnh duyệt:', err);
        gallery.innerHTML = '<p>Không thể tải ảnh.</p>';
      });
  }

  // 5. Xử lý upload ảnh không reload trang
  const form = document.getElementById("uploadForm");
  const status = document.getElementById("status");
  const imageInput = document.getElementById("imageInput");

  if (form && imageInput && status) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("📤 Bắt đầu upload...");

      const file = imageInput.files[0];
      if (!file) {
        status.textContent = "❌ Vui lòng chọn một ảnh.";
        return;
      }

      const formData = new FormData();
      formData.append("image", file);

      status.textContent = "⏳ Đang tải ảnh lên...";

      try {
        const res = await fetch("/upload", {
          method: "POST",
          body: formData,
        });

        const text = await res.text();
        status.textContent = text;
        form.reset();
      } catch (err) {
        console.error("❌ Lỗi upload:", err);
        status.textContent = "❌ Đã xảy ra lỗi khi tải ảnh.";
      }
    });
  }
});
// js/script.js
console.log("Script loaded");
// các đoạn xử lý DOM, fetch, form ở đây...
// 5. Xử lý đăng nhập và đăng ký
// 6. Hiển thị trạng thái đăng nhập
const authStatus = document.getElementById("auth-status");