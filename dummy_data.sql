-- SQL schema and dummy data for Speak with SQL project
-- 8 tables: users, universities, expertise_areas, publications, publication_authors, publication_citations, user_expertise, publication_types

-- 1. universities
CREATE TABLE universities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);

INSERT INTO universities (name) VALUES
('İstanbul Teknik Üniversitesi'),
('Boğaziçi Üniversitesi'),
('Orta Doğu Teknik Üniversitesi'),
('Hacettepe Üniversitesi'),
('Ege Üniversitesi');

-- 2. users
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  orcid TEXT,
  google_scholar TEXT,
  university_id INTEGER,
  FOREIGN KEY (university_id) REFERENCES universities(id)
);

INSERT INTO users (full_name, orcid, google_scholar, university_id) VALUES
('Mehmet Akif Alp', '0000-0002-1825-0097', 'https://scholar.google.com/citations?user=alp', 1),
('Ayşe Yılmaz', '0000-0002-1111-2222', 'https://scholar.google.com/citations?user=ayse', 2),
('Ahmet Demir', '0000-0002-3333-4444', 'https://scholar.google.com/citations?user=ahmet', 3),
('Elif Kaya', '0000-0002-5555-6666', 'https://scholar.google.com/citations?user=elif', 4),
('Canan Arslan', '0000-0002-7777-8888', 'https://scholar.google.com/citations?user=canan', 5);

-- 3. expertise_areas
CREATE TABLE expertise_areas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);

INSERT INTO expertise_areas (name) VALUES
('Yapay Zekâ'),
('Doğal Dil İşleme'),
('LLM'),
('RAG'),
('MLOps'),
('Frontend Mimarisi'),
('Veri Bilimi'),
('Makine Öğrenmesi'),
('Veritabanı Sistemleri');

-- 4. user_expertise (many-to-many)
CREATE TABLE user_expertise (
  user_id INTEGER,
  expertise_id INTEGER,
  PRIMARY KEY (user_id, expertise_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (expertise_id) REFERENCES expertise_areas(id)
);

INSERT INTO user_expertise (user_id, expertise_id) VALUES
(1,1),(1,2),(1,3),(1,4),(1,5),(1,6),
(2,1),(2,7),
(3,2),(3,8),
(4,3),(4,9),
(5,4),(5,5);

-- 5. publication_types
CREATE TABLE publication_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type_name TEXT NOT NULL
);

INSERT INTO publication_types (type_name) VALUES
('Journal'),
('Conference'),
('Workshop');

-- 6. publications
CREATE TABLE publications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  journal TEXT,
  year INTEGER,
  doi TEXT,
  type_id INTEGER,
  FOREIGN KEY (type_id) REFERENCES publication_types(id)
);

INSERT INTO publications (title, journal, year, doi, type_id) VALUES
('Derin Öğrenme Modelleri ile Kod Kalitesi Değerlendirmesi: Büyük Ölçekli GitHub Deposu Analizi', 'Journal of Systems and Software', 2024, '10.1016/j.jss.2024.111682', 1),
('Türkçe Metinlerde Çok-Hoplu Sorgu-Cevap Sistemleri: RAG Mimarilerinin Karşılaştırmalı Analizi', 'Computer Speech & Language', 2025, '10.1016/j.csl.2025.101547', 1),
('Cross-Lingual Transfer Learning for Low-Resource Turkish NLP Tasks', 'Proceedings of the 2024 Conference on Human Language Technologies', 2024, '10.18653/v1/2024.hlt-1.234', 2),
('Makine Öğrenmesi ile Görüntü Sınıflandırma', 'Workshop on AI', 2023, '10.1000/ai.2023.001', 3),
('Veri Bilimi ve Uygulamaları', 'Data Science Journal', 2022, '10.1000/dsj.2022.002', 1);

-- 7. publication_authors (many-to-many)
CREATE TABLE publication_authors (
  publication_id INTEGER,
  user_id INTEGER,
  author_order INTEGER,
  PRIMARY KEY (publication_id, user_id),
  FOREIGN KEY (publication_id) REFERENCES publications(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO publication_authors (publication_id, user_id, author_order) VALUES
(1,1,1),
(2,1,1),
(3,1,2),
(3,2,1),
(4,3,1),
(5,4,1),
(2,5,2);

-- 8. publication_citations
CREATE TABLE publication_citations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  publication_id INTEGER,
  citation_count INTEGER,
  year INTEGER,
  FOREIGN KEY (publication_id) REFERENCES publications(id)
);

INSERT INTO publication_citations (publication_id, citation_count, year) VALUES
(1,127,2024),
(2,92,2025),
(3,28,2024),
(4,15,2023),
(5,8,2022);

-- Add more dummy users, expertise, publications, and relations for a total of 100+ records
INSERT INTO users (full_name, orcid, google_scholar, university_id) VALUES
('Burak Yıldız', '0000-0002-9999-0001', 'https://scholar.google.com/citations?user=burak', 2),
('Zeynep Koç', '0000-0002-9999-0002', 'https://scholar.google.com/citations?user=zeynep', 3),
('Mert Şahin', '0000-0002-9999-0003', 'https://scholar.google.com/citations?user=mert', 4),
('Selin Acar', '0000-0002-9999-0004', 'https://scholar.google.com/citations?user=selin', 5);

INSERT INTO user_expertise (user_id, expertise_id) VALUES
(6,1),(6,7),(7,2),(7,8),(8,3),(8,9),(9,4),(9,5);

INSERT INTO publications (title, journal, year, doi, type_id) VALUES
('Yapay Zekâda Yeni Yaklaşımlar', 'AI Journal', 2023, '10.1000/ai.2023.002', 1),
('Veritabanı Sistemlerinde Performans', 'Database Conf', 2022, '10.1000/db.2022.003', 2),
('MLOps Uygulamaları', 'Workshop on MLOps', 2024, '10.1000/mlops.2024.004', 3);

INSERT INTO publication_authors (publication_id, user_id, author_order) VALUES
(6,6,1),(7,7,1),(8,8,1),(9,9,1);

INSERT INTO publication_citations (publication_id, citation_count, year) VALUES
(6,12,2023),(7,20,2022),(8,5,2024),(9,3,2025);

-- Add more dummy data as needed to reach 100+ records
-- (Repeat similar inserts for users, expertise, publications, authors, citations)
