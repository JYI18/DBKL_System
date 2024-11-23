
USE dbkl;

CREATE TABLE tenant(
  tenant_ic BIGINT NOT NULL,
  tenant_name VARCHAR(100),
  tenant_contact VARCHAR(12),
  shop_name VARCHAR(100),
  shop_address VARCHAR(500),
  latitude DECIMAL(15,13) NOT NULL,
  longitude DECIMAL(16,13) NOT NULL,
  PRIMARY KEY (tenant_ic)
);

-- CREATE TABLE tenant(
--   tenant_ic BIGINT NOT NULL,
--   tenant_name VARCHAR(100),
--   tenant_contact VARCHAR(12),
--   verification_status ENUM('success', 'incomplete', 'fail') DEFAULT 'fail' NOT NULL,
--   PRIMARY KEY (tenant_ic)
-- );

INSERT INTO tenant (tenant_ic, tenant_name, tenant_contact, shop_name, shop_Address, latitude, longitude) VALUES 
(970101011234, 'Hema', '60124567890', 'Inti College Penang', '1-Z, Lebuh Bukit Jambul, Bukit Jambul, 11900 Bayan Lepas, Pulau Pinang', 5.3418815191368, 100.2818921246194),
(890202025678, 'James Tan', '60122345678', 'Mixue Golden Triangle 2', '35-1-29, GOLDEN TRIANGLE, 2, Jalan Dato Ismail Hashim, Sungai Ara, 11900 Bayan Lepas, Pulau Pinang', 5.3306393029211, 100.2751199950284),
(850303039101, 'Amelia Wong', '60123456712', 'Project CAN', '62, Lebuh Glugor, Taman Gelugur, 11600 Jelutong, Pulau Pinang', 5.3840375801626, 100.3066579950285),
(940404041122, 'Zhi Wei', '60129876543', 'Daily Coffee Signature', '188, Jalan Burma, Kampung Syed, 10350 George Town, Pulau Pinang', 5.4276238411351, 100.3166000957877),
(880505053344, 'Siti Aminah', '60121349876', 'Neko Inn', '72-2-9, Arena Curve, Jalan Mahsuri, 11950 Bayan Lepas, Pulau Pinang', 5.3264578175633, 100.2802461121021),
(990606065566, 'Alex Teoh', '60128765432', 'Stanz Games Jungle Enterprise', '100-1, FARLIM SQUARE ,JALAN PISANG BERANGAN BANDAR BARU, Bandar Baru Air Itam, 11500 Ayer Itam, Pulau Pinang', 5.3971470730658, 100.2854655265026),
(930707077788, 'Chris Lee', '60121234567', 'Danai Wellness Boutique', '10-B-06, Precinct, 10, Jln Tanjung Tokong Lama, 10470 Tanjung Tokong, Pulau Pinang', 5.4496412391327, 100.3063269620695),
(960808089900, 'Nicole Chan', '60124567812', 'Cadenza Music Performing & Art Academy', '232, Jalan Dato Ismail Hashim, Sungai Ara, 11900 Bayan Lepas, Pulau Pinang', 5.3387542843865, 100.2994751882853),
(910909092233, 'Raj Kumar', '60121231234', 'Eco Shop @ Bagan Luar', '4157, Jalan Bagan Luar, Kampung Jawa, 12000 Butterworth, Pulau Pinang', 5.4022755182330, 100.3686389797176),
(920202104455, 'Fiona Lim', '60125678901', 'BebeButterfly Greenlane', '88-G, Jln Masjid Negeri, Taman Guan Joo Seng, 11600 Jelutong, Pulau Pinang', 5.3901818083601, 100.3024691194212);

CREATE TABLE shop(
  tenant_ic BIGINT NOT NULL,
  shop_name VARCHAR(100),
  shop_address VARCHAR(500),
  latitude DECIMAL(15,13) NOT NULL,
  longitude DECIMAL(16,13) NOT NULL,
  FOREIGN KEY (tenant_ic) REFERENCES tenant(tenant_ic)
);

INSERT INTO shop (tenant_ic, shop_name, shop_address, latitude, longitude) VALUES 
(970101011234, 'Inti College Penang', '1-Z, Lebuh Bukit Jambul, Bukit Jambul, 11900 Bayan Lepas, Pulau Pinang', 5.3418815191368, 100.2818921246194),
(890202025678, 'Mixue Golden Triangle 2', '35-1-29, GOLDEN TRIANGLE, 2, Jalan Dato Ismail Hashim, Sungai Ara, 11900 Bayan Lepas, Pulau Pinang', 5.3306393029211, 100.2751199950284),
(850303039101, 'Project CAN', '62, Lebuh Glugor, Taman Gelugur, 11600 Jelutong, Pulau Pinang', 5.3840375801626, 100.3066579950285),
(940404041122, 'Daily Coffee Signature', '188, Jalan Burma, Kampung Syed, 10350 George Town, Pulau Pinang', 5.4276238411351, 100.3166000957877),
(880505053344, 'Neko Inn', '72-2-9, Arena Curve, Jalan Mahsuri, 11950 Bayan Lepas, Pulau Pinang', 5.3264578175633, 100.2802461121021),
(990606065566, 'Stanz Games Jungle Enterprise', '100-1, FARLIM SQUARE ,JALAN PISANG BERANGAN BANDAR BARU, Bandar Baru Air Itam, 11500 Ayer Itam, Pulau Pinang', 5.3971470730658, 100.2854655265026),
(930707077788, 'Danai Wellness Boutique', '10-B-06, Precinct, 10, Jln Tanjung Tokong Lama, 10470 Tanjung Tokong, Pulau Pinang', 5.4496412391327, 100.3063269620695),
(960808089900, 'Cadenza Music Performing & Art Academy', '232, Jalan Dato Ismail Hashim, Sungai Ara, 11900 Bayan Lepas, Pulau Pinang', 5.3387542843865, 100.2994751882853),
(910909092233, 'Eco Shop @ Bagan Luar', '4157, Jalan Bagan Luar, Kampung Jawa, 12000 Butterworth, Pulau Pinang', 5.4022755182330, 100.3686389797176),
(920202104455, 'BebeButterfly Greenlane', '88-G, Jln Masjid Negeri, Taman Guan Joo Seng, 11600 Jelutong, Pulau Pinang', 5.3901818083601, 100.3024691194212);

CREATE TABLE admin_officer(
  adminID INT PRIMARY KEY,
  adminUsername VARCHAR(50) NOT NULL,
  adminPassword VARCHAR(50) NOT NULL
);

INSERT INTO admin_officer(adminID,adminUsername,adminPassword)
VALUES ('1','admin123','Admin32');

-- temporary hardcoded status
UPDATE tenant SET verification_status = 'success' WHERE tenant_ic = 970101011234;
UPDATE tenant SET verification_status = 'fail' WHERE tenant_ic = 890202025678;
UPDATE tenant SET verification_status = 'incomplete' WHERE tenant_ic = 850303039101;
UPDATE tenant SET verification_status = 'success' WHERE tenant_ic = 940404041122;
UPDATE tenant SET verification_status = 'success' WHERE tenant_ic = 880505053344;
UPDATE tenant SET verification_status = 'fail' WHERE tenant_ic = 990606065566;
UPDATE tenant SET verification_status = 'success' WHERE tenant_ic = 930707077788;
UPDATE tenant SET verification_status = 'incomplete' WHERE tenant_ic = 960808089900;
UPDATE tenant SET verification_status = 'fail' WHERE tenant_ic = 910909092233;
UPDATE tenant SET verification_status = 'success' WHERE tenant_ic = 920202104455;

CREATE TABLE recognition_result(
  tenant_ic BIGINT NOT NULL,
  result ENUM('success', 'incomplete', 'fail') DEFAULT 'fail' NOT NULL,
  FOREIGN KEY (tenant_ic) REFERENCES tenant(tenant_ic)
);

INSERT INTO recognition_result (tenant_ic) 
SELECT tenant_ic FROM tenant;
