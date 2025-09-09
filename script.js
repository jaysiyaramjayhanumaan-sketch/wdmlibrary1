let seats = JSON.parse(localStorage.getItem("seats")) || Array.from({length: 100}, (_, i) => ({
    seatNo: i+1, name: "", mobile: "", admissionDate: "", months: "", dueDate: "", fees: "", photo: ""
}));

let editIndex = null;

// Status function
function getStatus(dueDate){
    if(!dueDate) return {text: "", class: "", priority: 3};
    let today = new Date();
    let d = new Date(dueDate);
    let diffDays = Math.floor((d - today) / (1000*60*60*24));
    if(diffDays < 0){
        return {text: `Overdue ${Math.abs(diffDays)} days`, class: "overdue", priority: 1};
    } else if(diffDays <= 3){
        return {text: "Due Soon", class: "due-soon", priority: 2};
    }
    return {text: "", class: "", priority: 3};
}

// Render seats
function renderSeats(showEmptyOnly = false, filter = "all") {
    const grid = document.getElementById('seatGrid');
    grid.innerHTML = "";

    // Toggle grid classes
    if(showEmptyOnly){
        grid.classList.add('grid-view');
        grid.classList.remove('show-all');
    } else {
        grid.classList.remove('grid-view');
        grid.classList.add('show-all');
    }

    seats.sort((a,b)=>{
        let aStatus = getStatus(a.dueDate);
        let bStatus = getStatus(b.dueDate);
        if(aStatus.priority !== bStatus.priority){
            return aStatus.priority - bStatus.priority;
        }
        return a.seatNo - b.seatNo;
    });

    seats.forEach((seat,index)=>{
        let isEmpty = !seat.name || seat.name.trim() === "";
        if (filter === "empty" && !isEmpty) return;
        if (filter === "filled" && isEmpty) return;


        let statusInfo = getStatus(seat.dueDate);
        let card = document.createElement('div');
        card.className = 'card';
        if(!isEmpty) card.classList.add('occupied');

        if (filter === "empty" && isEmpty) {
    // Empty seat - theatre style
    card.style.width = '40px';
    card.style.height = '40px';
    card.style.display = 'flex';
    card.style.justifyContent = 'center';
    card.style.alignItems = 'center';
    card.style.fontSize = '12px';
    card.style.backgroundColor = '#fff';
    card.style.border = '1px solid #999';
    card.textContent = seat.seatNo;
} else
if (filter === "filled" && !isEmpty) {
    // Filled seat - theatre style
    card.style.width = '40px';
    card.style.height = '40px';
    card.style.display = 'flex';
    card.style.justifyContent = 'center';
    card.style.alignItems = 'center';
    card.style.fontSize = '12px';
    card.style.backgroundColor = '#dff0d8'; // light green
    card.style.border = '1px solid #666';
    card.textContent = seat.seatNo;
    card.classList.add('occupied');
} else {
            // Occupied seats → normal cards
            card.style.width = '';
            card.style.height = '';
            card.innerHTML = `
                <img src="${seat.photo || 'https://via.placeholder.com/200'}" alt="Photo">
                <div class="details">
                    <strong>Seat:</strong> ${seat.seatNo}<br>
                    <strong>Name:</strong> ${seat.name}<br>
                    <strong>Mobile:</strong> ${seat.mobile}<br>
                    <strong>Admission:</strong> ${seat.admissionDate}<br>
                    <strong>Months:</strong> ${seat.months}<br>
                    <strong>Due Date:</strong> ${seat.dueDate}<br>
                    <strong>Fees:</strong> ${seat.fees}
                </div>
                <div class="status ${statusInfo.class}">${statusInfo.text}</div>
                <div class="button-group">
                    <button class="edit-btn" onclick="editSeat(${index})">✏️ Edit</button>
                    ${(statusInfo.priority === 1 || statusInfo.priority === 2) && seat.mobile
    ? `<a class="call-btn" href="tel:${seat.mobile}">📞 Call</a>
       <button class="whatsapp-btn" onclick="openWhatsApp('${seat.mobile}', '${seat.name}')">💬 WhatsApp</button>
`
    : ""}

                </div>
            `;
        }
        grid.appendChild(card);
    });
}


function editSeat(index){
    editIndex = index;
    let seat = seats[index];
    document.getElementById('editName').value = seat.name || "";
    document.getElementById('editMobile').value = seat.mobile || "";
    document.getElementById('editAdmissionDate').value = seat.admissionDate || "";
    document.getElementById('editMonths').value = seat.months || "";
    document.getElementById('editFees').value = seat.fees || "";
    document.getElementById('editDueDate').value = seat.dueDate || "";
    document.getElementById('photoPreview').src = seat.photo || "";
document.getElementById('editPhoto').onchange = function(e){
    let file = e.target.files[0];
    if(file){
        let reader = new FileReader();
        reader.onload = function(evt){
            document.getElementById('photoPreview').src = evt.target.result;
        }
        reader.readAsDataURL(file);
    }
}

    document.getElementById('editModal').style.display = 'flex';

    document.getElementById('editMonths').oninput = updateDueDate;
    document.getElementById('editAdmissionDate').oninput = updateDueDate;




// Call & WhatsApp update
document.getElementById("callBtn").href = "tel:" + (seat.mobile || "");
document.getElementById("whatsappBtn").href = "https://wa.me/" + (seat.mobile || "");

document.getElementById('editPhoto').onchange = function(e){
        let file = e.target.files[0];
        if(file){
            let reader = new FileReader();
            reader.onload = function(evt){
                document.getElementById('photoPreview').src = evt.target.result;
            }
            reader.readAsDataURL(file);
        }
    }
}









// Update due date
function updateDueDate(){
    let admission = document.getElementById('editAdmissionDate').value;
    let months = parseInt(document.getElementById('editMonths').value);
    if(admission && months){
        let ad = new Date(admission);
        ad.setMonth(ad.getMonth()+months);
        document.getElementById('editDueDate').value = ad.toISOString().split('T')[0];
    }
}

// Save seat
function saveSeat(){
    let seat = seats[editIndex];
    seat.name = document.getElementById('editName').value;
    seat.mobile = document.getElementById('editMobile').value;
    seat.admissionDate = document.getElementById('editAdmissionDate').value;
    seat.months = document.getElementById('editMonths').value;
    seat.fees = document.getElementById('editFees').value;
    seat.dueDate = document.getElementById('editDueDate').value;
    seat.photo = document.getElementById('photoPreview').src;
// ✅ Debug line
    console.log("Photo saved for seat " + seat.seatNo, seat.photo);

    localStorage.setItem("seats", JSON.stringify(seats));
    closeModal();
    renderSeats();
}
function downloadBlob(blob, filename) {
    var reader = new FileReader();
    reader.onload = function() {
        var base64 = reader.result;
        AndroidBridge.saveBase64File(base64, filename);
    };
    reader.readAsDataURL(blob);
}


// Delete seat
function deleteSeat(){
    if(confirm("Are you sure you want to delete this seat's data?")){
        seats[editIndex] = { seatNo: seats[editIndex].seatNo, name: "", mobile: "", admissionDate: "", months: "", dueDate: "", fees: "", photo: "" };
        localStorage.setItem("seats", JSON.stringify(seats));
        closeModal();
        renderSeats();
    }
}

// Close modal
function closeModal(){
    document.getElementById('editModal').style.display = 'none';
}
function showNotifications() {
    let today = new Date().toISOString().split('T')[0];
    let dueSoonList = [];
    let overdueList = [];

    seats.forEach(s => {
        if (s.dueDate) {
            let diff = Math.floor((new Date(s.dueDate) - new Date(today)) / (1000*60*60*24));
            if (diff < 0) {
                overdueList.push({ name: s.name || "Unknown", seat: s.seatNo, days: Math.abs(diff) });
            } else if (diff <= 3) {
                dueSoonList.push({ name: s.name || "Unknown", seat: s.seatNo, days: diff });
            }
        }
    });

    if (dueSoonList.length > 0 || overdueList.length > 0) {
        let html = `<h2>📢 Fee Alerts</h2>`;

        if (overdueList.length > 0) {
            html += `<h3 style="color:white;background:#ff4d4d;padding:5px;border-radius:5px;">Overdue</h3><ul>`;
            overdueList.forEach(s => {
                html += `<li><strong>${s.name}</strong> (Seat ${s.seat}) - Overdue ${s.days} days</li>`;
            });
            html += `</ul>`;
        }

        if (dueSoonList.length > 0) {
            html += `<h3 style="color:black;background:#ffcc00;padding:5px;border-radius:5px;">Due Soon</h3><ul>`;
            dueSoonList.forEach(s => {
                html += `<li><strong>${s.name}</strong> (Seat ${s.seat}) - Due in ${s.days} days</li>`;
            });
            html += `</ul>`;
        }

        html += `<button onclick='this.parentElement.parentElement.remove()'>Close</button>`;

        let modal = document.createElement('div');
        modal.className = 'modal notify-modal';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.innerHTML = `<div class='modal-content'>${html}</div>`;
        document.body.appendChild(modal);
    }
}


// WhatsApp function
function openWhatsApp(number,name){
    let cleanNumber = number.replace(/\D/g,"");
    if(!cleanNumber.startsWith("91")) cleanNumber = "91"+cleanNumber;
    window.location.href = `whatsapp://send?phone=${cleanNumber}&text=${encodeURIComponent("Hello "+name+", Your library fee is due. Please settle it at the earliest to keep enjoying library services.Thank you!")}`;
}

// Show empty / all buttons
document.getElementById('showEmptyBtn').addEventListener('click',function(){
    renderSeats(false, "empty");
    this.style.display = 'none';
    document.getElementById('showAllBtn').style.display = 'inline-block';
});

document.getElementById('showAllBtn').addEventListener('click',function(){
    renderSeats(false, "all");
    this.style.display = 'none';
    document.getElementById('showEmptyBtn').style.display = 'inline-block';
});
document.getElementById('showFilledBtn').addEventListener('click', function () {
    renderSeats(false, "filled");


    document.getElementById('showAllBtn').style.display = 'inline-block';

});

function backupData() {
    const dataStr = JSON.stringify(seats);

    // ✅ Check if AndroidBridge exists
    if (typeof AndroidBridge !== "undefined" && AndroidBridge.backup) {
        AndroidBridge.backup(dataStr); // ✅ Call Android native code
    } else {
        // fallback for browser testing
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'seat-backup.json';
        a.click();
        URL.revokeObjectURL(url);
    }
}


// ✅ Restore Function
function restoreData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedData = JSON.parse(e.target.result);

      // Ensure it's a valid array of seats
      if (!Array.isArray(importedData)) {
        alert("Invalid backup format.");
        return;
      }

      seats = importedData;
      localStorage.setItem("seats", JSON.stringify(seats));
      renderSeats();
      alert("Data restored successfully!");
    } catch (err) {
      alert("Invalid backup file.");
    }
  };
  reader.readAsText(file);
}

// ✅ Attach button listeners
document.querySelector('.backup-btn').addEventListener('click', backupData);

// ✅ Hidden input for restore
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'application/json';
fileInput.style.display = 'none';
fileInput.addEventListener('change', restoreData);
document.body.appendChild(fileInput);

// ✅ Trigger file input when restore button clicked
// ✅ Trigger file input when restore button clicked
document.querySelector('.restore-btn').addEventListener('click', () => {
  // Check if AndroidBridge is available (i.e. running inside app)
  if (typeof AndroidBridge !== "undefined" && AndroidBridge.requestRestore) {
    AndroidBridge.requestRestore(); // Native side will send JSON via JS
  } else {
    fileInput.click(); // Fallback for browser
  }
});

// Change input type & placeholder based on search type selected
document.getElementById('searchType').addEventListener('change', function() {
  const input = document.getElementById('searchInput');
  if (this.value === 'seatNo') {
    input.type = 'number';
    input.placeholder = "Enter seat number";
    input.value = "";
  } else {
    input.type = 'text';
    input.placeholder = "Enter name";
    input.value = "";
  }
});



// Search
document.getElementById('searchType').addEventListener('change', function() {
    const input = document.getElementById('searchInput');
    if (this.value === 'seatNo') {
        input.type = "number";
        input.placeholder = "Enter seat number";
        input.value = "";
    } else {
        input.type = "text";
        input.placeholder = "Enter name";
        input.value = "";
    }
});

document.getElementById('searchBtn').addEventListener('click', () => {
    const type = document.getElementById('searchType').value;
    const queryRaw = document.getElementById('searchInput').value.trim();
    const query = queryRaw.toLowerCase();
    const resultDiv = document.getElementById('searchResult');
    resultDiv.innerHTML = "";

    if (!queryRaw) {
        resultDiv.innerHTML = "<p>Please enter a search term.</p>";
        return;
    }

    let foundSeat = null;
    if (type === "name") {
        foundSeat = seats.find(seat => seat.name.toLowerCase() === query);
    } else if (type === "seatNo") {
        const seatNumber = parseInt(queryRaw, 10);
        if (isNaN(seatNumber)) {
            resultDiv.innerHTML = "<p>Please enter a valid seat number.</p>";
            return;
        }
        foundSeat = seats.find(seat => Number(seat.seatNo) === seatNumber);
    }

    if (foundSeat) {
        const statusInfo = getStatus(foundSeat.dueDate);
        resultDiv.innerHTML = `
        <div class="card" style="max-width: 300px;">
            <img src="${foundSeat.photo || 'https://via.placeholder.com/200'}" alt="Photo" style="width:100%; height:auto;">
            <div class="details">
                <strong>Seat:</strong> ${foundSeat.seatNo}<br>
                <strong>Name:</strong> ${foundSeat.name}<br>
                <strong>Mobile:</strong> ${foundSeat.mobile}<br>
                <strong>Admission:</strong> ${foundSeat.admissionDate}<br>
                <strong>Months:</strong> ${foundSeat.months}<br>
                <strong>Due Date:</strong> ${foundSeat.dueDate}<br>
                <strong>Fees:</strong> ${foundSeat.fees}<br>
                <div class="status ${statusInfo.class}" style="margin-top: 8px;">${statusInfo.text}</div>
            </div>
 <div class="button-group" style="margin-top:10px;">
                    <button class="edit-btn" onclick="editSeat(${foundSeat.seatNo - 1})">✏️ Edit</button>
                </div>

        </div>`;
        document.getElementById('clearSearchBtn').style.display = "inline-block";
    } else {
        resultDiv.innerHTML = "<p>No matching seat found.</p>";
    }
});

document.getElementById('clearSearchBtn').addEventListener('click', function() {
    document.getElementById('searchResult').innerHTML = "";
    document.getElementById('searchInput').value = "";
    this.style.display = "none";
    renderSeats();
});

window.onload = () => {
    renderSeats();
    showNotifications();   // ✅ Fee Alerts bhi page load par show honge
};

// ✅ Remove Photo button functionality
let removePhotoBtn = document.getElementById("removePhotoBtn");
if(removePhotoBtn){
    removePhotoBtn.addEventListener("click", () => {
        document.getElementById("photoPreview").src = "";
        if(editIndex !== null){
            seats[editIndex].photo = "";   // remove from data also
            localStorage.setItem("seats", JSON.stringify(seats));
        }
    });
}
// ✅ Call & WhatsApp buttons ko dynamic banane ke liye
function updateContactLinks() {
    let mobileInput = document.getElementById("editMobile");
    let callBtn = document.getElementById("callBtn");
    let whatsappBtn = document.getElementById("whatsappBtn");

    if (mobileInput && callBtn && whatsappBtn) {
        let number = mobileInput.value.trim();

        // Agar 10 digit number hai to '91' prefix add karo
        if (number.length === 10) {
            number = "91" + number;
        }

        callBtn.href = "tel:" + number;
        whatsappBtn.href = "https://wa.me/" + number;
    }
}

// 🔄 Jab modal khulta hai ya number edit hota hai
document.addEventListener("DOMContentLoaded", function () {
    let mobileInput = document.getElementById("editMobile");
    if (mobileInput) {
        mobileInput.addEventListener("input", updateContactLinks);
    }
});

// ✅ WhatsApp click handler without changing existing code
document.addEventListener("DOMContentLoaded", function () {
    function handleWhatsAppClick(e) {
        e.preventDefault();

        // Close modal if open
        if (typeof closeModal === "function") closeModal();

        // Show seat grid
        const seatGrid = document.getElementById('seatGrid');
        if (seatGrid) seatGrid.style.display = 'grid';

        // Clear search result
        const searchResult = document.getElementById('searchResult');
        if (searchResult) searchResult.innerHTML = "";

        // Open WhatsApp link in new tab (or native app in WebView)
        const href = e.currentTarget.getAttribute("href");
        if (href) window.location.href = href;
    }



    // Attach handler to all existing and future WhatsApp buttons
    function attachWhatsAppHandlers() {
        const whatsappButtons = document.querySelectorAll(".whatsapp-btn");
        whatsappButtons.forEach(btn => {
            btn.removeEventListener("click", handleWhatsAppClick);
            btn.addEventListener("click", handleWhatsAppClick);
        });
    }

    // Initial attachment
    attachWhatsAppHandlers();

    // Observe DOM changes to attach to future buttons dynamically
    const observer = new MutationObserver(attachWhatsAppHandlers);
    observer.observe(document.body, { childList: true, subtree: true });
});
function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // ✅ Use seats from localStorage / current array
    const rows = seats
    .filter(s => s.name && s.name.trim() !== "")  // sirf filled seats
    .map(s => [
        s.seatNo,
        s.name,
        s.mobile,
        s.admissionDate,
        s.dueDate,
        s.fees,
        s.month  // ✅ Add month column here
    ]);

// Report Title
doc.setFont("helvetica", "bold");
doc.setFontSize(18);
doc.setTextColor(40, 40, 40);
doc.text("Wisdom Library Seat Report", doc.internal.pageSize.getWidth() / 2, 15, { align: "center" });

 // Table Generation
doc.autoTable({
    startY: 25,
    head: [["Seat No", "Name", "Mobile", "Admission Date", "Due Date", "Fees", "Month"]],

    body: rows, // Make sure `rows` is a 2D array of string or number values
    theme: 'grid',

    styles: {
        fontSize: 11,
        font: "helvetica",
        halign: 'center',
        textColor: 20,
    },

    headStyles: {
        fillColor: [0, 102, 204],  // Blue background
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: 'center',
    },

    bodyStyles: {
        fontStyle: "normal",
    },

    alternateRowStyles: {
        fillColor: [245, 245, 245], // Light gray for alternate rows
    },

    didDrawPage: function (data) {
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height || doc.internal.pageSize.getHeight();
        const pageWidth = pageSize.width || doc.internal.pageSize.getWidth();
        const pageCount = doc.internal.getNumberOfPages();
        const pageCurrent = data.pageNumber;

        // Page number at bottom center
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(100);
        doc.text(`Page ${pageCurrent} of ${pageCount}`, pageWidth / 2, pageHeight - 5, { align: "center" });
    }
});

// === Summary Section (Last Page Only) ===

const totalSeats = rows.length;
const totalFees = rows.reduce((sum, r) => {
    let fee = Number(r[5]);
    return sum + (isNaN(fee) ? 0 : fee);
}, 0);

// Move to last page (in case there are multiple pages)
const totalPages = doc.internal.getNumberOfPages();
doc.setPage(totalPages);

// Draw Summary Box
const pageSize = doc.internal.pageSize;
const pageWidth = pageSize.width || doc.internal.pageSize.getWidth();
const pageHeight = pageSize.height || doc.internal.pageSize.getHeight();

const boxX = 14;
const boxY = pageHeight - 25;
const boxWidth = pageWidth - 28;
const boxHeight = 14;

// Green background box
doc.setFillColor(0, 153, 51);  // Green
doc.rect(boxX, boxY, boxWidth, boxHeight, 'F');

// Summary Text
doc.setTextColor(255, 255, 255); // White
doc.setFont("helvetica", "bold");
doc.setFontSize(12);
doc.text(
    `Total Seats Filled: ${totalSeats} | Total Fees Collected: ${totalFees}`,
    pageWidth / 2,
    boxY + 9,
    { align: "center" }
);


// Download PDF
    // Blob बनाओ
var blob = doc.output("blob");
// ✅ अब AndroidBridge से save करवाओ
downloadBlob(blob, "wisdom-library-seat-report.pdf");

}
function downloadBlob(blob, filename) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 100);
}
// Restore backup from Android (called via AndroidBridge)
function restoreDataFromAndroid(jsonStr) {
  try {
    if (!jsonStr || typeof jsonStr !== "string") {
      alert("No data provided from Android.");
      return;
    }

    let importedData = JSON.parse(jsonStr);
    if (!Array.isArray(importedData)) {
      alert("Invalid backup format from Android.");
      return;
    }

    importedData = importedData.map((s, i) => ({
      seatNo: s.seatNo ?? (i + 1),
      name: s.name ?? "",
      mobile: s.mobile ?? "",
      admissionDate: s.admissionDate ?? "",
      months: s.months ?? "",
      dueDate: s.dueDate ?? "",
      fees: s.fees ?? "",
      photo: s.photo ?? ""
    }));

    seats = importedData;
    localStorage.setItem("seats", JSON.stringify(seats));
    renderSeats();
    alert("Data restored successfully from Android!");
  } catch (e) {
    alert("Failed to restore data from Android: " + e.message);
    console.error("Restore Error:", e);
  }
}





