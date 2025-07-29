import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import UserNavBar from '../layouts/UserNavBar';
import '../../CSS/ColorBlindTest.css';

const MAX_PLATES = 14;

const ColorBlindTest = () => {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [imageList, setImageList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [predictedNumber, setPredictedNumber] = useState('');
  const [answers, setAnswers] = useState([]);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [savingResults, setSavingResults] = useState(false);

  // Calibration states
  const [showCalibrationModal, setShowCalibrationModal] = useState(false);
  const [calibrationStep, setCalibrationStep] = useState(1);
  const [calibrationData, setCalibrationData] = useState({
    camera: { status: 'checking', message: 'Initializing camera...' },
    distance: { value: 0, status: 'measuring', message: 'Position yourself at optimal distance' },
    lighting: { value: 0, status: 'checking', message: 'Checking lighting conditions' }
  });
  const [calibrationComplete, setCalibrationComplete] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:8000/api/plates")
      .then(res => {
        const shuffled = [...res.data.plates];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setImageList(shuffled.slice(0, MAX_PLATES));
      })
      .catch(err => {
        console.error("Error fetching image list:", err);
      });
  }, []);

  // Hardcoded calibration simulation
  useEffect(() => {
    let calibrationInterval;
    
    if (showCalibrationModal && calibrationStep <= 3) {
      calibrationInterval = setInterval(() => {
        simulateCalibrationProgress();
      }, 1000);
    }

    return () => {
      if (calibrationInterval) clearInterval(calibrationInterval);
    };
  }, [showCalibrationModal, calibrationStep]);

  // Hardcoded calibration simulation function
  const simulateCalibrationProgress = () => {
    setCalibrationData(prev => {
      const newData = { ...prev };
      
      // Simulate camera check (Step 1)
      if (calibrationStep === 1) {
        newData.camera = { 
          status: 'connected', 
          message: 'Camera ready ✓' 
        };
        
        // Auto advance to step 2 after 2 seconds
        setTimeout(() => setCalibrationStep(2), 2000);
      }
      
      // Simulate distance measurement (Step 2)
      else if (calibrationStep === 2) {
        const randomDistance = Math.floor(Math.random() * 15) + 50; // 50-65cm
        newData.distance = {
          value: randomDistance,
          status: randomDistance >= 55 && randomDistance <= 60 ? 'optimal' : 'adjusting',
          message: randomDistance >= 55 && randomDistance <= 60 ? 'Perfect distance ✓' : 'Adjusting position...'
        };
        
        // Auto advance to step 3 after optimal distance
        if (randomDistance >= 55 && randomDistance <= 60) {
          setTimeout(() => setCalibrationStep(3), 1500);
        }
      }
      
      // Simulate lighting check (Step 3)
      else if (calibrationStep === 3) {
        const randomLighting = Math.floor(Math.random() * 25) + 75; // 75-100%
        newData.lighting = {
          value: randomLighting,
          status: randomLighting >= 80 ? 'optimal' : 'adjusting',
          message: randomLighting >= 80 ? 'Lighting optimal ✓' : 'Adjusting lighting...'
        };
        
        // Complete calibration when lighting is optimal
        if (randomLighting >= 80) {
          setTimeout(() => {
            setCalibrationStep(4);
            setTimeout(() => {
              setShowCalibrationModal(false);
              setCalibrationComplete(true);
            }, 1500);
          }, 1500);
        }
      }
      
      return newData;
    });
  };

  useEffect(() => {
    if (imageList.length === 0) return;
    const fetchAndPredict = async () => {
      setLoadingPrediction(true);
      setPredictedNumber('');
      setUserAnswer('');
      try {
        const imgUrl = `http://localhost:8000${imageList[currentIndex].url}`;
        const imgRes = await fetch(imgUrl);
        const imgBlob = await imgRes.blob();
        const fd = new FormData();
        fd.append('file', imgBlob, imageList[currentIndex].filename);

        const res = await axios.post(
          'http://localhost:8000/api/colorblindness/predict',
          fd,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        setPredictedNumber(res.data.predicted_number?.toString() ?? '');
      } catch (err) {
        setPredictedNumber('');
        setUserAnswer('');
      }
      setLoadingPrediction(false);
    };
    fetchAndPredict();
  }, [currentIndex, imageList.length]);

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  };

  const handleSubmit = async () => {
    const currentFile = imageList[currentIndex];
    const correctLabel = currentFile.label.toString();
    const isCorrect = userAnswer === correctLabel;
    const imgRes = await fetch(`http://localhost:8000${imageList[currentIndex].url}`);
    const imgBlob = await imgRes.blob();
    const imageBase64 = await blobToBase64(imgBlob);

    setAnswers(prev => [
      ...prev,
      {
        plate_number: currentIndex + 1,
        image_base64: imageBase64,
        filename: imageList[currentIndex].filename,
        correct_answer: correctLabel,
        user_answer: userAnswer,
        is_correct: isCorrect
      }
    ]);
    if (currentIndex + 1 < MAX_PLATES) {
      setCurrentIndex(prev => prev + 1);
    } else {
      analyzeAndSave();
    }
  };

  const typeMap = {
    "1": "protanopia",
    "2": "deuteranopia",
    "3": "tritanopia"
  };

  const analyzeAndSave = async () => {
    setSavingResults(true);
    const lastImgBlob = await fetch(`http://localhost:8000${imageList[MAX_PLATES - 1].url}`).then(r => r.blob());
    const lastImageBase64 = await blobToBase64(lastImgBlob);

    const typeCounts = { protanopia: 0, deuteranopia: 0, tritanopia: 0 };
    const allAnswers = [
      ...answers,
      {
        plate_number: MAX_PLATES,
        image_base64: lastImageBase64,
        filename: imageList[MAX_PLATES - 1].filename,
        correct_answer: imageList[MAX_PLATES - 1].label.toString(),
        user_answer: userAnswer,
        is_correct: userAnswer === imageList[MAX_PLATES - 1].label.toString()
      }
    ];

    allAnswers.forEach((ans, idx) => {
      if (!ans.is_correct) {
        const plate = imageList[idx];
        const typeId = plate.type?.toString();
        const hiddenType = typeMap[typeId];
        if (hiddenType) typeCounts[hiddenType]++;
      }
    });

    let suspected_type = "normal";
    let maxCount = 0;
    Object.entries(typeCounts).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        suspected_type = type;
      }
    });
    if (maxCount < 3) suspected_type = "normal";

    const total_wrong = allAnswers.filter(a => !a.is_correct).length;
    const total_correct = allAnswers.filter(a => a.is_correct).length;

    let userId = null;
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const userObj = JSON.parse(userData);
        const candidateId = userObj?.id || userObj?.id || null;
        if (candidateId && /^[0-9a-fA-F]{24}$/.test(candidateId)) {
          userId = candidateId;
        }
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      alert("Error retrieving user data. Please login again.");
      setSavingResults(false);
      return;
    }
    if (!userId) {
      alert("Error: User ID is invalid or missing. Please login again.");
      setSavingResults(false);
      return;
    }

    const payload = {
      user_id: userId,
      plates: allAnswers,
      suspected_type,
      confidence: Math.max(0, 100 - total_wrong * 7),
      device_info: { os: window.navigator.platform }
    };

    try {
      await axios.post("http://localhost:8000/api/colorblindness/save-result", payload);
      navigate('/color-blind-result');
    } catch (e) {
      console.error("Error saving results:", e);
      alert("Error saving results. Please try again later.");
      setSavingResults(false);
    }
  };

  const handleNumpadClick = (num) => {
    setUserAnswer(prev => prev + num);
  };

  const handleClear = () => {
    setUserAnswer('');
  };

  // Start calibration
  const startCalibration = () => {
    setShowCalibrationModal(true);
    setCalibrationStep(1);
    setCalibrationData({
      camera: { status: 'checking', message: 'Initializing camera...' },
      distance: { value: 0, status: 'measuring', message: 'Position yourself at optimal distance' },
      lighting: { value: 0, status: 'checking', message: 'Checking lighting conditions' }
    });
  };

  // Skip calibration
  const skipCalibration = () => {
    setShowCalibrationModal(false);
    setCalibrationComplete(true);
  };

  if (imageList.length === 0) {
    return (
      <>
        <UserNavBar />
        <div className="colorblind-loading">Loading images...</div>
      </>
    );
  }

  // Show calibration modal
  if (showCalibrationModal) {
    return (
      <>
        <UserNavBar />
        <div className="calibration-modal-overlay">
          <div className="calibration-modal">
            <div className="calibration-header">
              <h2>📷 Color Vision Test Calibration</h2>
              <p>Step {calibrationStep} of 3 - Optimizing your testing environment</p>
            </div>

            <div className="calibration-content">
              {/* Real Camera Feed with Oval Frame */}
              <div className="calibration-camera">
                <div className="camera-preview-container">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      width: 640,
                      height: 480,
                      facingMode: "user"
                    }}
                    className="calibration-webcam"
                  />
                  
                  {/* Oval Frame Overlay */}
                  <div className="calibration-overlay">
                    <div className={`calibration-oval ${calibrationData.camera.status === 'connected' && calibrationData.distance.status === 'optimal' && calibrationData.lighting.status === 'optimal' ? 'optimal' : ''}`}>
                      <div className="oval-content">
                        {calibrationStep === 1 && (
                          <div className="step-indicator">
                            <span className="step-icon">📹</span>
                            <p>{calibrationData.camera.message}</p>
                          </div>
                        )}
                        
                        {calibrationStep === 2 && (
                          <div className="step-indicator">
                            <span className="step-value">{calibrationData.distance.value}cm</span>
                            <p>{calibrationData.distance.message}</p>
                          </div>
                        )}
                        
                        {calibrationStep === 3 && (
                          <div className="step-indicator">
                            <span className="step-value">{calibrationData.lighting.value}%</span>
                            <p>{calibrationData.lighting.message}</p>
                          </div>
                        )}
                        
                        {calibrationStep === 4 && (
                          <div className="step-indicator">
                            <span className="step-icon">✅</span>
                            <p>Calibration Complete!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calibration Status */}
              <div className="calibration-status">
                <div className="status-grid">
                  <div className={`status-item ${calibrationData.camera.status === 'connected' ? 'completed' : 'active'}`}>
                    <span className="status-number">1</span>
                    <div className="status-info">
                      <h4>Camera Check</h4>
                      <p>{calibrationData.camera.message}</p>
                    </div>
                    <span className="status-icon">
                      {calibrationData.camera.status === 'connected' ? '✅' : '⏳'}
                    </span>
                  </div>

                  <div className={`status-item ${calibrationStep >= 2 ? (calibrationData.distance.status === 'optimal' ? 'completed' : 'active') : 'pending'}`}>
                    <span className="status-number">2</span>
                    <div className="status-info">
                      <h4>Distance Measurement</h4>
                      <p>{calibrationStep >= 2 ? calibrationData.distance.message : 'Waiting...'}</p>
                    </div>
                    <span className="status-icon">
                      {calibrationData.distance.status === 'optimal' ? '✅' : calibrationStep >= 2 ? '📏' : '⏳'}
                    </span>
                  </div>

                  <div className={`status-item ${calibrationStep >= 3 ? (calibrationData.lighting.status === 'optimal' ? 'completed' : 'active') : 'pending'}`}>
                    <span className="status-number">3</span>
                    <div className="status-info">
                      <h4>Lighting Check</h4>
                      <p>{calibrationStep >= 3 ? calibrationData.lighting.message : 'Waiting...'}</p>
                    </div>
                    <span className="status-icon">
                      {calibrationData.lighting.status === 'optimal' ? '✅' : calibrationStep >= 3 ? '💡' : '⏳'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="calibration-controls">
              {calibrationStep < 4 ? (
                <>
                  <button onClick={skipCalibration} className="colorblind-btn colorblind-btn-clear">
                    Skip Calibration
                  </button>
                  <div className="calibration-info">
                    <p>Calibration is automatically progressing...</p>
                  </div>
                </>
              ) : (
                <button onClick={() => setShowCalibrationModal(false)} className="colorblind-btn colorblind-btn-submit">
                  ✅ Start Test
                </button>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Show saving state when processing results
  if (savingResults) {
    return (
      <>
        <UserNavBar />
        <div className="colorblind-analysis-container">
          <div className="colorblind-analysis-card">
            <h2 className="colorblind-analysis-title">Processing Results...</h2>
            <div className="colorblind-analysis-content">
              <p style={{ fontSize: '1.2em', color: '#666' }}>
                Please wait while we analyze your test results and save them.
              </p>
              <div style={{
                marginTop: '20px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid #f3f3f3',
                  borderTop: '4px solid #007bff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
              </div>
            </div>
          </div>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <UserNavBar />
      <div className="colorblind-container">
        <div className="colorblind-test-card">
          {/* Show calibration button if not completed */}
          {!calibrationComplete && (
            <div className="calibration-prompt">
              <button
                onClick={startCalibration}
                className="colorblind-btn colorblind-btn-submit"
                style={{ marginBottom: '20px', fontSize: '1.1em', padding: '12px 24px' }}
              >
                📷 Run Calibration
              </button>
              <p style={{ color: '#666', fontSize: '0.9em', marginBottom: '20px' }}>
                Recommended: Run calibration for optimal test conditions
              </p>
            </div>
          )}

          <div className="colorblind-image-section">
            <img
              src={`http://localhost:8000${imageList[currentIndex].url}`}
              alt="Ishihara Plate"
              className="colorblind-image"
            />
            <div className="colorblind-answer-display">
              Your Answer: <span className="colorblind-answer-text">{userAnswer}</span>
            </div>
            <div className="colorblind-plate-counter">
              Plate {currentIndex + 1} of {MAX_PLATES}
            </div>
          </div>

          <div className="colorblind-controls-section">
            <div className="colorblind-numpad">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  className="colorblind-numpad-button"
                  onClick={() => handleNumpadClick(num.toString())}
                >
                  {num}
                </button>
              ))}
              <div></div>
              <button
                className="colorblind-numpad-button"
                onClick={() => handleNumpadClick("0")}
              >
                0
              </button>
              <div></div>
            </div>

            <div className="colorblind-action-buttons">
              <button
                onClick={handleClear}
                className="colorblind-btn colorblind-btn-clear"
              >
                Clear
              </button>
              <button
                onClick={handleSubmit}
                className="colorblind-btn colorblind-btn-submit"
                disabled={userAnswer === ''}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ColorBlindTest;