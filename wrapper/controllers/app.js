const httpz = require("@octanuary/httpz")
let discord;
require("../../utils/discord")
	.then((f) => discord = f);
const database = require("../../data/database"), DB = new database(true);
const { SWF_URL, STORE_URL, CLIENT_URL } = process.env;
const group = new httpz.Group();

// video list
group.route("*", "/", (req, res) => {
	discord("Video List");
	res.render("list", {});
});
// settings
group.route("*", "/settings", (req, res) => {
	discord("Settings");
	res.render("settings", {});
});
// themelist page
group.route("GET", "/create", (req, res) => {
	discord("Choosing a Theme");
	const { TRUNCATED_THEMELIST } = DB.select();
	res.render("create", { truncatedThemelist: TRUNCATED_THEMELIST });
});
// flash pages
group.route("GET", "/cc", async (req, res) => {
	discord("Character Creator");
	let flashvars = {
		appCode: "go",
		ctc: "go",
		isEmbed: 1,
		isLogin: "Y",
		m_mode: "school",
		page: "",
		siteId: "go",
		tlang: "en_US",
		ut: 60,
		// options
		bs: "adam",
		original_asset_id: req.query["id"] || "",
		themeId: "family",
		// paths
		apiserver: "/",
		storePath: STORE_URL + "/<store>",
		clientThemePath: CLIENT_URL + "/<client_theme>"
	};
	Object.assign(flashvars, req.query);
	res.render("app/char", {
		title: "Character Creator",
		attrs: {
			data: SWF_URL + "/cc.swf",
			type: "application/x-shockwave-flash", 
			id: "char_creator", 
			width: "960", 
			height: "600", 
			class: "char_object"
		},
		params: {
			flashvars,
			allowScriptAccess: "always",
			movie: SWF_URL + "/cc.swf",
		},
		isExternal: req.query.external || false,
		object: toObjectString
	});
});
group.route("GET", "/cc_browser", async (req, res) => {
	discord("Character Browser");
	let flashvars = {
		appCode: "go",
		ctc: "go",
		isEmbed: 1,
		isLogin: "Y",
		m_mode: "school",
		page: "",
		siteId: "go",
		tlang: "en_US",
		ut: 60,
		// options
		themeId: "family",
		// paths
		apiserver: "/",
		storePath: STORE_URL + "/<store>",
		clientThemePath: CLIENT_URL + "/<client_theme>"
	};
	Object.assign(flashvars, req.query);
	res.render("app/char", {
		title: "Character Browser",
		attrs: {
			data: SWF_URL + "/cc_browser.swf",
			type: "application/x-shockwave-flash", 
			id: "char_creator", 
			width: "100%", 
			height: "600", 
			class: "char_object"
		},
		params: {
			flashvars,
			allowScriptAccess: "always",
			movie: SWF_URL + "/cc.swf",
		},
		isExternal: req.query.external || false,
		object: toObjectString
	});
});
group.route("GET", "/go_full", async (req, res) => {
	discord("Video Maker");
	const { IS_WIDE } = DB.select();
	let flashvars = {
		appCode: "go",
		collab: 0,
		ctc: "go",
		goteam_draft_only: 1,
		isLogin: "Y",
		isWide: IS_WIDE,
		lid: 0,
		nextUrl: "/",
		page: "",
		retut: 1,
		siteId: "go",
		tray: "custom",
		tlang: "en_US",
		ut: 60,
		apiserver: "http://localhost:4343/",
		storePath: STORE_URL + "/<store>",
		clientThemePath: CLIENT_URL + "/<client_theme>",
	};
	Object.assign(flashvars, req.query);
	res.render("app/studio", {
		attrs: {
			data: SWF_URL + "/go_full.swf",
			type: "application/x-shockwave-flash", width: "100%", height: "100%",
		},
		params: {
			flashvars,
			allowScriptAccess: "always",
		},
		object: toObjectString
	});
});
group.route("GET", "/player", async (req, res) => {
	discord("Video Player");
	const { IS_WIDE, DEFAULT_WATERMARK } = DB.select();
	let flashvars = {
		autostart: 1,
		isWide: IS_WIDE,
		isWixPaid: DEFAULT_WATERMARK == "wix" ? 0 : 1,
		ut: 60,
		apiserver: "/",
		storePath: STORE_URL + "/<store>",
		clientThemePath: CLIENT_URL + "/<client_theme>",
	};
	Object.assign(flashvars, req.query);
	res.render("app/player", {
		attrs: {
			data: SWF_URL + "/player.swf",
			type: "application/x-shockwave-flash", width: "100%", height: "100%",
		},
		params: {
			flashvars,
			allowFullScreen: "true",
			allowScriptAccess: "always",
		},
		object: toObjectString
	});
});

function toAttrString(table) {
	return typeof (table) == "object" ? new URLSearchParams(table).toString() : table.replace(/"/g, "\\\"");
}
function toParamString(table) {
	return Object.keys(table).map(key =>
		`<param name="${key}" value="${toAttrString(table[key])}">`
	).join(" ");
}
function toObjectString(attrs, params) {
	return `<object id="obj" ${Object.keys(attrs).map(key =>
		`${key}="${attrs[key].replace(/"/g, "\\\"")}"`
	).join(" ")}>${toParamString(params)}</object>`;
}

module.exports = group;
