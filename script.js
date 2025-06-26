'use strict';

const { useState, useRef, useEffect, forwardRef, memo, createElement } = React;
const { createRoot } = ReactDOM;

// --- Helper Components ---
const e = createElement;

const Icon = ({ paths, lines, polylines, circles }) => e('svg', { 
    xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", 
    fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round",
    className: "mx-auto h-12 w-12 text-slate-400 group-hover:text-red-500"
},
    paths && paths.map(d => e('path', { d })),
    lines && lines.map(l => e('line', l)),
    polylines && polylines.map(p => e('polyline', p)),
    circles && circles.map(c => e('circle', c))
);

const IconFileUp = () => e(Icon, { paths: ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"], polylines: [{points: "17 8 12 3 7 8"}], lines: [{x1:"12", y1:"3", x2:"12", y2:"15"}] });
const IconDownload = () => e(Icon, { paths: ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"], polylines: [{points: "7 10 12 15 17 10"}], lines: [{x1:"12", y1:"15", x2:"12", y2:"3"}], className: "w-5 h-5" });
const IconRotate = () => e(Icon, { paths: ["M1 12A11 11 0 1 0 12 1a11 11 0 0 0 0 22z", "M15.62 8.38a6 6 0 1 0-7.24 7.24", "M8 12h.01", "M12 12h.01", "M16 12h.01"], className: "w-6 h-6 text-slate-600" });
const IconAlert = () => e(Icon, { paths: ["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"], lines: [{x1:"12", y1:"9", x2:"12", y2:"13"}, {x1:"12", y1:"17", x2:"12.01", y2:"17"}], className: "h-6 w-6 flex-shrink-0" });

// --- Date Formatting Helper ---
const formatDate = (dateInput) => {
    if (dateInput instanceof Date && !isNaN(dateInput)) {
        const day = String(dateInput.getDate()).padStart(2, '0');
        const month = String(dateInput.getMonth() + 1).padStart(2, '0');
        const year = dateInput.getFullYear();
        return `${day}.${month}.${year}`;
    }
    if (typeof dateInput === 'string') return dateInput;
    return 'N/A';
};

// --- 3D Face Viewer Component ---
const FaceViewer = ({ photoUrl }) => {
    const mountRef = useRef(null);
    useEffect(() => {
        if (!photoUrl || !mountRef.current) return;
        const mountNode = mountRef.current;
        mountNode.innerHTML = '';
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf1f5f9);
        const camera = new THREE.PerspectiveCamera(75, mountNode.clientWidth / mountNode.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mountNode.clientWidth, mountNode.clientHeight);
        mountNode.appendChild(renderer.domElement);
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(5, 10, 7.5);
        scene.add(directionalLight);
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableZoom = false;
        controls.minPolarAngle = Math.PI / 4;
        controls.maxPolarAngle = Math.PI * (3 / 4);
        let animationFrameId;
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(photoUrl, (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.repeat.x = -1;
            const geometry = new THREE.CylinderGeometry(2, 2, 3, 64);
            const material = new THREE.MeshStandardMaterial({ map: texture });
            const cylinder = new THREE.Mesh(geometry, material);
            scene.add(cylinder);
            camera.position.z = 4.5;
            const animate = () => {
                animationFrameId = requestAnimationFrame(animate);
                controls.update();
                renderer.render(scene, camera);
            };
            animate();
        });
        const handleResize = () => {
            if (mountNode) {
                camera.aspect = mountNode.clientWidth / mountNode.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(mountNode.clientWidth, mountNode.clientHeight);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            if (mountNode && renderer.domElement) {
               mountNode.removeChild(renderer.domElement);
            }
        };
    }, [photoUrl]);
    return e('div', { ref: mountRef, className: "w-full h-full min-h-[300px] rounded-lg" });
};

// --- ID Card Component ---
const IDCard = forwardRef(({ person }, ref) => {
    if (!person) return null;
    return e('div', { ref, className: "p-4 bg-gray-100 rounded-lg" },
        e('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
            // Front
            e('div', { className: "bg-white rounded-xl shadow-lg p-5 border border-gray-200 font-sans", style: { fontFamily: '"Arial", sans-serif' } },
                e('div', { className: "flex justify-between items-center pb-2 border-b-2 border-red-600" },
                    e('div', null, e('p', { className: "text-xs font-bold" }, "TÜRKİYE CUMHURİYETİ"), e('p', { className: "text-xs text-red-600" }, "REPUBLIC OF TURKEY")),
                    e('div', { className: "text-red-600 text-3xl font-bold" }, "★"),
                    e('div', null, e('p', { className: "text-xs font-bold text-right" }, "İKAMET İZNİ BELGESİ"), e('p', { className: "text-xs text-red-600 text-right" }, "RESIDENCE PERMIT DOCUMENT"))
                ),
                e('div', { className: "flex mt-4 gap-4" },
                    e('div', { className: "w-1/3" }, 
                        e('div', { className: "w-full aspect-[3/4] bg-gray-200 rounded-md flex items-center justify-center" }, 
                            person.photoUrl ? e('img', { src: person.photoUrl, alt: "Personal", className: "w-full h-full object-cover rounded-md" }) : e('span', { className: "text-gray-400 text-xs text-center" }, "Photo")
                        )
                    ),
                    e('div', { className: "w-2/3 space-y-2 text-sm" },
                        e('div', null, e('p', { className: "text-xs text-red-600" }, "Soyadı / Surname"), e('p', { className: "font-bold uppercase" }, person.Surname)),
                        e('div', null, e('p', { className: "text-xs text-red-600" }, "Adı / Name"), e('p', { className: "font-bold uppercase" }, person.Name)),
                        e('div', null, e('p', { className: "text-xs text-red-600" }, "Uyruğu / Nationality"), e('p', { className: "font-bold uppercase" }, person.Nationality)),
                        e('div', null, e('p', { className: "text-xs text-red-600" }, "Doğum Tarihi / Date of Birth"), e('p', { className: "font-bold" }, formatDate(person.Birthdate)))
                    )
                ),
                e('div', { className: "flex justify-end mt-4" }, e('div', { className: "w-2/3" }, e('p', { className: "text-xs text-red-600" }, "Yabancı Kimlik Numarası / Foreigner ID Number"), e('p', { className: "font-mono font-bold text-base" }, person.IDNumber)))
            ),
            // Back
            e('div', { className: "bg-white rounded-xl shadow-lg p-5 border border-gray-200 relative flex flex-col", style: { fontFamily: '"Arial", sans-serif' } },
                e('div', { className: "grid grid-cols-1 gap-y-3 text-sm flex-grow" },
                    e('div', null, e('p', { className: "text-xs text-red-600" }, "İkamet İzni Türü / Type of Residence Permit"), e('p', { className: "font-bold text-red-700 uppercase" }, person.PermitType)),
                    e('div', null, e('p', { className: "text-xs text-red-600" }, "Anne Adı / Mother's Name"), e('p', { className: "font-bold uppercase" }, person.MotherName)),
                    e('div', null, e('p', { className: "text-xs text-red-600" }, "Baba Adı / Father's Name"), e('p', { className: "font-bold uppercase" }, person.FatherName)),
                    e('div', null, e('p', { className: "text-xs text-red-600" }, "Veren Makam / Issuing Authority"), e('p', { className: "font-bold" }, "GÖÇ İDARESİ GENEL MÜDÜRLÜĞÜ")),
                    e('div', null, e('p', { className: "text-xs text-red-600" }, "Geçerlilik Tarihleri / Valid From - Until"), e('p', { className: "font-bold" }, `${formatDate(person.ValidFrom)} - ${formatDate(person.ValidUntil)}`))
                ),
                e('div', { className: "absolute bottom-0 left-0 right-0 bg-red-700 text-white text-center text-xs p-2 rounded-b-xl" }, "Bu belge sahibine Türkiye'de yasal kalış hakkı sağlar. / This document grants its holder the right of legal stay in Turkey.")
            )
        )
    );
});

// --- Main App Component ---
function App() {
    const [identities, setIdentities] = useState([]);
    const [currentIdentityIndex, setCurrentIdentityIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fileName, setFileName] = useState('');
    const idCardRef = useRef(null);
    
    const currentIdentity = identities[currentIdentityIndex] || null;

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setFileName(file.name);
        setError(null);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);
                if (json.length > 0) {
                    const requiredKeys = ["Name", "Surname", "Nationality", "Birthdate", "MotherName", "FatherName", "IDNumber", "PermitType", "ValidFrom", "ValidUntil", "Gender", "Age"];
                    const firstRowKeys = Object.keys(json[0]);
                    const missingKeys = requiredKeys.filter(key => !firstRowKeys.includes(key));
                    if (missingKeys.length > 0) {
                        setError(`Excel file is missing columns: ${missingKeys.join(', ')}`);
                        return;
                    }
                }
                setIdentities(json.map(item => ({...item, photoUrl: null})));
                setCurrentIdentityIndex(0);
            } catch (err) {
                setError("Failed to parse Excel file. Please ensure it's a valid .xlsx file.");
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const generatePhoto = async () => {
        if (!currentIdentity || currentIdentity.photoUrl) return;

        setIsLoading(true);
        setError(null);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
            const prompt = `Professional passport photograph of a ${currentIdentity.Age}-year-old ${currentIdentity.Gender} person of ${currentIdentity.Nationality} descent. Neutral facial expression, looking directly at the camera. Plain, solid light-grey background. Centered, head and shoulders view. High detail, photorealistic. No smiling, no glasses, no hats, no accessories.`;
            const payload = { instances: [{ prompt }], parameters: { "sampleCount": 1 } };
            const apiKey = "AIzaSyDWfc0sKsB5JUHGO2Je15iQz_TuDhK4wQ0"; 
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));
                throw new Error(`API request failed: ${response.status} - ${errorBody.error?.message || 'Unknown error'}`);
            }

            const result = await response.json();

            if (result.predictions && result.predictions[0]?.bytesBase64Encoded) {
                const imageUrl = `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
                const updatedIdentities = [...identities];
                updatedIdentities[currentIdentityIndex].photoUrl = imageUrl;
                setIdentities(updatedIdentities);
            } else {
                throw new Error("No image data found in API response.");
            }
        } catch (err) {
            clearTimeout(timeoutId);
            if (err.name === 'AbortError') {
                setError('Image generation timed out. Please try again.');
            } else {
                setError(`Failed to generate photo: ${err.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = (format) => {
        if (!idCardRef.current || !currentIdentity) return;
        html2canvas(idCardRef.current, { scale: 3, backgroundColor: null }).then(canvas => {
            const link = document.createElement('a');
            link.download = `residence_permit_${currentIdentity.Name}_${currentIdentity.Surname}.${format}`;
            link.href = canvas.toDataURL(`image/${format}`);
            link.click();
        });
    };

    const nextIdentity = () => setCurrentIdentityIndex(prev => (prev + 1) % identities.length);
    const prevIdentity = () => setCurrentIdentityIndex(prev => (prev - 1 + identities.length) % identities.length);
    
    return e('div', { className: "relative min-h-screen text-slate-800" },
        isLoading && e('div', { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" },
            e('div', { className: "flex flex-col items-center" },
                e('div', { className: "animate-spin rounded-full h-16 w-16 border-b-4 border-white mb-4" }),
                e('p', { className: "text-white text-lg font-semibold" }, "Generating Image...")
            )
        ),
        e('header', { className: "bg-white shadow-md" },
            e('div', { className: "container mx-auto px-4 py-4 flex justify-between items-center" },
                e('h1', { className: "text-2xl font-bold text-red-700" }, "İkamet İzni Jeneratörü"),
                e('p', { className: "text-sm text-slate-600" }, "Turkish Residence Permit Generator")
            )
        ),
        e('main', { className: "container mx-auto px-4 py-8" },
            e('div', { className: "grid grid-cols-1 lg:grid-cols-3 gap-8" },
                e('div', { className: "lg:col-span-1 bg-white p-6 rounded-xl shadow-lg h-fit" },
                    e('h2', { className: "text-xl font-semibold mb-4 border-b pb-2" }, "Kontrol Paneli"),
                    e('div', { className: "mb-6" },
                        e('label', { className: "block text-sm font-medium text-slate-700 mb-2" }, "1. Excel Dosyasını Yükle (.xlsx)"),
                        e('label', { htmlFor: "file-upload", className: "cursor-pointer group flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-slate-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors" },
                            e('div', { className: "text-center" }, e(IconFileUp), e('p', { className: "mt-2 text-sm text-slate-600 group-hover:text-red-600" }, fileName ? `Seçilen: ${fileName}` : "Dosya seçmek için tıklayın"))
                        ),
                        e('input', { id: "file-upload", type: "file", className: "sr-only", onChange: handleFileUpload, accept: ".xlsx" })
                    ),
                    identities.length > 0 && e('div', { className: "mb-6" },
                        e('label', { className: "block text-sm font-medium text-slate-700 mb-2" }, "2. Kimlik Seçimi"),
                        e('div', { className: "flex items-center justify-between bg-slate-50 p-2 rounded-lg" },
                            e('button', { onClick: prevIdentity, className: "px-3 py-2 bg-white border rounded-md shadow-sm hover:bg-slate-100" }, "← Önceki"),
                            e('span', { className: "font-semibold text-center" }, `${currentIdentityIndex + 1} / ${identities.length}`),
                            e('button', { onClick: nextIdentity, className: "px-3 py-2 bg-white border rounded-md shadow-sm hover:bg-slate-100" }, "Sonraki →")
                        )
                    ),
                    currentIdentity && e('div', { className: "mb-6" },
                        e('label', { className: "block text-sm font-medium text-slate-700 mb-2" }, "3. Fotoğraf Oluştur"),
                        e('button', { onClick: generatePhoto, disabled: isLoading || !!currentIdentity.photoUrl, className: "w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition-all" },
                            currentIdentity.photoUrl ? 'Fotoğraf Oluşturuldu ✓' : 'AI ile Fotoğraf Oluştur'
                        )
                    ),
                    currentIdentity && currentIdentity.photoUrl && e('div', null,
                        e('label', { className: "block text-sm font-medium text-slate-700 mb-2" }, "4. Belgeyi İndir"),
                        e('div', { className: "flex space-x-2" },
                            e('button', { onClick: () => handleDownload('png'), className: "flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all" }, e(IconDownload, {className: "w-5 h-5"}), " PNG")
                        )
                    ),
                    error && e('div', { className: "mt-4 flex items-start gap-2.5 text-red-700 bg-red-100 p-4 rounded-lg" }, e(IconAlert, {className:"h-6 w-6 flex-shrink-0"}), e('p', { className: "text-sm font-medium" }, error))
                ),
                e('div', { className: "lg:col-span-2 space-y-8" },
                    currentIdentity ? e(React.Fragment, null,
                        e('div', { className: "bg-white p-6 rounded-xl shadow-lg" }, 
                           e('h2', { className: "text-xl font-semibold mb-4 border-b pb-2" }, "Oluşturulan Belge"), 
                           e(IDCard, { person: currentIdentity, ref: idCardRef })
                        ),
                        e('div', { className: "bg-white p-6 rounded-xl shadow-lg" },
                           e('h2', { className: "text-xl font-semibold mb-4 border-b pb-2 flex items-center gap-2" }, e(IconRotate, {className:"w-6 h-6 text-slate-600"}), "360° Yüz Görüntüleyici"),
                           e('div', { className: "w-full h-96 bg-slate-100 rounded-lg relative" }, 
                                currentIdentity.photoUrl ? e(FaceViewer, { key: currentIdentity.photoUrl, photoUrl: currentIdentity.photoUrl }) : e('div', { className: "flex items-center justify-center h-full text-slate-500" }, "Fotoğraf oluşturulduktan sonra burada görünecektir.")
                           )
                        )
                    ) : e('div', { className: "lg:col-span-2 flex flex-col items-center justify-center bg-white p-12 rounded-xl shadow-lg h-full text-center" },
                        e(IconFileUp, {className: "h-24 w-24 text-slate-300 mb-4"}),
                        e('h2', { className: "text-2xl font-semibold text-slate-700" }, "Başlamak için bir Excel dosyası yükleyin"),
                        e('p', { className: "text-slate-500 mt-2 max-w-md" }, "Kimlik belgelerini oluşturmaya başlamak için lütfen kontrol panelindeki talimatları izleyin.")
                    )
                )
            )
        )
    );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(e(App));
