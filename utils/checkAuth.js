function requireLogin(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.send(`
            <script>
                if (confirm("로그인이 필요한 기능입니다. 로그인 페이지로 이동하시겠습니까?")) {
                    window.location.href = "/login";
                }
            </script>
        `);
    }
    next();
}

function requirePostLogin(req, res, next) {
    console.log("🔍 로그인 확인 미들웨어 실행됨");
    if (!req.session || !req.session.user) {
        return res.status(401).json({
            error: "로그인이 필요합니다.",
            redirect: "/login"
        });
    }
    next();
}


function forceLogin(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.send(`
            <script>
                alert("로그인이 필요합니다.");
                window.location.href = "/login";
            </script>
        `);
    }
    next();
}

function requireAdmin(req, res, next) {
    if (!req.session || !req.session.user || req.session.user.isAdmin !== "true") {
        return res.send(`
            <script>
                alert("관리자 권한이 필요합니다.");
                window.location.href = "/";
            </script>
        `);
    }
    next();
}


module.exports = {
    requireLogin,
    requirePostLogin,
    forceLogin,
    requireAdmin
};