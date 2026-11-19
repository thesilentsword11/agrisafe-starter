import { useEffect, useRef, useState } from 'react'
import { Camera, ImagePlus, Upload, X, Leaf, ShieldCheck, AlertTriangle } from 'lucide-react'

const CLASSES = [
  'Apple', 'Banana', 'Beetroot', 'Bell Pepper', 'Cabbage', 'Capsicum',
  'Carrot', 'Cauliflower', 'Chilli Pepper', 'Corn', 'Cucumber', 'Eggplant',
  'Garlic', 'Ginger', 'Grapes', 'Jalapeño', 'Kiwi', 'Lemon', 'Lettuce',
  'Mango', 'Onion', 'Orange', 'Paprika', 'Pear', 'Peas', 'Pineapple',
  'Pomegranate', 'Potato', 'Radish', 'Soybeans', 'Spinach', 'Sweet Corn',
  'Sweet Potato', 'Tomato', 'Turnip', 'Watermelon'
]

export default function LeafScreening() {
  const [model, setModel] = useState(null)
  const [modelStatus, setModelStatus] = useState('Loading AI model...')
  const [imageUrl, setImageUrl] = useState('')
  const [imageElement, setImageElement] = useState(null)
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const galleryRef = useRef(null)
  const cameraRef = useRef(null)

  useEffect(() => {
    let active = true
    let loadedModel

    async function loadModel() {
      try {
        if (!window.tf) throw new Error('TensorFlow.js did not load.')

        const tf = window.tf
        try {
          await tf.setBackend('webgl')
        } catch {
          await tf.setBackend('cpu')
        }

        await tf.ready()
        loadedModel = await tf.loadLayersModel('/agrisafe-model/model.json')

        const warmup = tf.zeros([1, 224, 224, 3])
        const output = loadedModel.predict(warmup)
        await output.data()
        warmup.dispose()
        output.dispose()

        if (active) {
          setModel(loadedModel)
          setModelStatus('AI model ready')
        } else {
          loadedModel.dispose()
        }
      } catch (e) {
        console.error(e)
        if (active) setModelStatus('Model unavailable — refresh and try again')
      }
    }

    loadModel()

    return () => {
      active = false
      if (loadedModel) loadedModel.dispose()
    }
  }, [])

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl)
    }
  }, [imageUrl])

  function chooseImage(file) {
    setError('')
    setResult(null)
    setImageElement(null)

    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image.')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('Please choose an image smaller than 20 MB.')
      return
    }

    const url = URL.createObjectURL(file)
    setImageUrl(url)
  }

  function analyseImage() {
    if (!model || !imageElement) return

    setBusy(true)
    setError('')
    setResult(null)

    let inputTensor
    let prediction

    try {
      const tf = window.tf

      inputTensor = tf.tidy(() => {
        const pixels = tf.browser.fromPixels(imageElement, 3)
        const resized = tf.image.resizeBilinear(pixels, [224, 224], true)
        return resized.toFloat().div(127.5).sub(1).expandDims(0)
      })

      prediction = model.predict(inputTensor)

      prediction.data().then(values => {
        if (values.length !== CLASSES.length) {
          throw new Error('Unexpected model output.')
        }

        let bestIndex = 0
        for (let i = 1; i < values.length; i++) {
          if (values[i] > values[bestIndex]) bestIndex = i
        }

        setResult({
          name: CLASSES[bestIndex],
          confidence: (Number(values[bestIndex]) * 100).toFixed(1)
        })
      }).catch(e => {
        console.error(e)
        setError('Could not analyze this image. Please try another photo.')
      }).finally(() => {
        inputTensor?.dispose()
        prediction?.dispose()
        setBusy(false)
      })
    } catch (e) {
      console.error(e)
      inputTensor?.dispose()
      prediction?.dispose()
      setBusy(false)
      setError('Could not analyze this image. Please try another photo.')
    }
  }

  return (
    <div className="leaf-screening">
      <div className="page-heading">
        <div>
          <span className="eyebrow">AI IMAGE ANALYSIS</span>
          <h1>Leaf Image Screening</h1>
          <p>Upload a produce image to identify its most likely vegetable or fruit category.</p>
        </div>
      </div>

      <section className="panel leaf-screen-panel">
        <div className="leaf-model-status">
          <span className={model ? 'leaf-status-dot ready' : 'leaf-status-dot'} />
          {modelStatus}
        </div>

        <div className="leaf-screen-content">
          <div className="leaf-image-preview">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Selected produce"
                onLoad={e => setImageElement(e.currentTarget)}
              />
            ) : (
              <div className="leaf-empty-preview">
                <ImagePlus size={42} />
                <b>Select a produce image</b>
                <span>Choose one clear fruit or vegetable in the photo.</span>
              </div>
            )}
          </div>

          <div className="leaf-upload-actions">
            <button className="btn secondary" onClick={() => cameraRef.current?.click()}>
              <Camera size={17} /> Camera
            </button>
            <button className="btn secondary" onClick={() => galleryRef.current?.click()}>
              <Upload size={17} /> Gallery
            </button>
            {imageUrl && (
              <button className="btn secondary" onClick={() => {
                setImageUrl('')
                setImageElement(null)
                setResult(null)
                setError('')
              }}>
                <X size={17} /> Remove
              </button>
            )}
          </div>

          <input ref={cameraRef} hidden type="file" accept="image/*" capture="environment"
            onChange={e => chooseImage(e.target.files?.[0])} />
          <input ref={galleryRef} hidden type="file" accept="image/*"
            onChange={e => chooseImage(e.target.files?.[0])} />

          {error && <div className="form-error">{error}</div>}

          <button
            className="btn primary full"
            disabled={!model || !imageElement || busy}
            onClick={analyseImage}
          >
            {busy ? 'Analyzing image...' : 'Identify Produce'}
          </button>

          {result && (
            <div className="leaf-prediction">
              <span className="eyebrow">AI PREDICTION</span>
              <div className="leaf-prediction-name">
                <Leaf size={24} />
                <h2>{result.name}</h2>
              </div>
              <p>Model confidence score: <b>{result.confidence}%</b></p>
              <small>
                This is the model's best match among its 36 trained categories.
                Confidence is not a guarantee of correct identification.
              </small>
            </div>
          )}
        </div>
      </section>

      <section className="panel leaf-residue-warning">
        <div className="leaf-warning-icon"><ShieldCheck size={22} /></div>
        <div>
          <h3>Pesticide residue status: Cannot be determined from photo</h3>
          <p>
            Image recognition identifies the produce category only. It cannot
            detect pesticide residues or establish whether food is safe.
            Laboratory testing is required to measure residues and compare
            the results with applicable, verified MRL limits.
          </p>
        </div>
      </section>

      <div className="info-strip">
        <div className="info-icon"><AlertTriangle size={18} /></div>
        <div>
          <b>Model limitation</b>
          <p>
            This model always selects a best match from its 36 categories,
            even for unfamiliar images. Use clear, single-item photos and
            verify the identification.
          </p>
        </div>
      </div>
    </div>
  )
}
