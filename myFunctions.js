$(document).ready(function () {

    // ===== إظهار/إخفاء التفاصيل =====
    $(".details-checkbox").change(function () {
        $(this).closest("tr").next(".details-row").toggle();
    });

    // ===== زر متابعة: التحقق من اختيار سيارة واحدة على الأقل =====
    $("#btnContinue").click(function () {
        var count = $("input[name='selectcar']:checked").length;
        if (count === 0) {
            $("#carsMsg").text("الرجاء اختيار سيارة واحدة على الأقل.");
            $("#bookingSection").slideUp();
        } else {
            $("#carsMsg").text("");
            $("#bookingSection").slideDown();
        }
    });

    // ===== إرسال النموذج =====
    $("#bookingForm").submit(function (e) {
        e.preventDefault();
        processBooking();
    });

});

// ---------- دوال التحقق ----------

function parseDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (m === null) {
        return null;
    }
    var y = parseInt(m[1], 10);
    var mo = parseInt(m[2], 10);
    var d = parseInt(m[3], 10);
    var date = new Date(Date.UTC(y, mo - 1, d));

    if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) {
        return null;
    }
    return date;
}

function validateName(name) {
    if (name === "") { return ""; }
    if (!/^[\u0621-\u064A ]+$/.test(name)) {
        return "الاسم يجب أن يحتوي أحرفاً عربية ومسافات فقط.";
    }
    return "";
}

function validateNationalId(id) {
    if (id === "") { return "الرقم الوطني إلزامي."; }
    if (!/^\d{11}$/.test(id)) {
        return "الرقم الوطني يجب أن يتكون من 11 رقماً.";
    }
    var province = parseInt(id.substring(0, 2), 10);
    if (province < 1 || province > 14) {
        return "أول خانتين يجب أن تكونا بين 01 و 14.";
    }
    return "";
}

function validateMobile(mobile) {
    if (mobile === "") { return ""; }
    if (!/^09[345689]\d{7}$/.test(mobile)) {
        return "رقم غير مطابق لشبكتي Syriatel أو MTN.";
    }
    return "";
}

function validateEmail(email) {
    if (email === "") { return ""; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return "صيغة البريد الإلكتروني غير صحيحة.";
    }
    return "";
}

// ---------- معالجة وحساب الحجز ----------

function processBooking() {
    var name = $.trim($("#fullName").val());
    var id = $.trim($("#nationalId").val());
    var sStr = $.trim($("#startDate").val());
    var eStr = $.trim($("#endDate").val());
    var mobile = $.trim($("#mobile").val());
    var email = $.trim($("#email").val());

    var valid = true;
    $(".error-msg").text("");

    var msg = validateName(name);
    if (msg !== "") { $("#errName").text(msg); valid = false; }

    msg = validateNationalId(id);
    if (msg !== "") { $("#errId").text(msg); valid = false; }

    msg = validateMobile(mobile);
    if (msg !== "") { $("#errMobile").text(msg); valid = false; }

    msg = validateEmail(email);
    if (msg !== "") { $("#errEmail").text(msg); valid = false; }

    var startDate = null;
    var endDate = null;

    if (sStr === "") {
        $("#errStart").text("تاريخ البداية إلزامي."); valid = false;
    } else {
        startDate = parseDate(sStr);
        if (startDate === null) {
            $("#errStart").text("تاريخ غير صالح، الصيغة yyyy-mm-dd."); valid = false;
        }
    }

    if (eStr === "") {
        $("#errEnd").text("تاريخ النهاية إلزامي."); valid = false;
    } else {
        endDate = parseDate(eStr);
        if (endDate === null) {
            $("#errEnd").text("تاريخ غير صالح، الصيغة yyyy-mm-dd."); valid = false;
        }
    }

    if (startDate !== null && endDate !== null && endDate <= startDate) {
        $("#errEnd").text("تاريخ النهاية يجب أن يكون لاحقاً لتاريخ البداية."); valid = false;
    }

    if (!valid) { return; }

    var days = Math.round((endDate - startDate) / 86400000);
    var total = 0;
    var lines = "";

    $("input[name='selectcar']:checked").each(function () {
        var row = $(this).closest("tr");
        var model = $.trim(row.find("td").eq(1).text());
        var price = parseInt(row.find("td").eq(3).text().replace(/[^0-9]/g, ""), 10);
        var carTotal = price * days;
        total += carTotal;
        lines += $(this).val() + " - " + model + ": " + days + " يوم × " + price + " = " + carTotal + " ل.س\n";
    });

    var discount = 0;
    if (days > 7) {
        discount = total * 0.10;
    }
    var finalAmount = total - discount;

    var result = "نتيجة الحجز:\n\n" + lines +
                 "\nعدد أيام التأجير: " + days +
                 "\nالمجموع: " + total + " ل.س" +
                 "\nالخصم: " + discount + " ل.س" +
                 "\nالمبلغ النهائي للدفع: " + finalAmount + " ل.س";
    alert(result);
}