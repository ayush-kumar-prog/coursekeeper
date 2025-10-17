# Computer Vision Papers Mapped to CS231n Topics (2017-2025)

## 1. Convolutional Neural Networks & Architectures

### EfficientNet: Rethinking Model Scaling (2019)
- **Authors**: Tan & Le
- **arXiv**: 1905.11946
- **Year**: 2019
- **Key Contribution**: Systematic compound scaling of network depth, width, and resolution
- **Impact**: Achieved better efficiency than previous CNNs, set new standards for architecture design
- **CS231n Topics**: Core CNN architecture, Neural Architecture Search

### Swin Transformer: Hierarchical Vision Transformer (2021)
- **Authors**: Liu et al.
- **arXiv**: 2103.14030
- **Year**: 2021
- **Key Contribution**: Hierarchical Transformer with shifted window attention
- **Impact**: Became new backbone for many vision tasks, bridging Transformers and CNNs
- **CS231n Topics**: Transformer architectures, hierarchical feature learning

### An Image is Worth 16x16 Words: Vision Transformer (ViT) (2020)
- **Authors**: Dosovitskiy et al.
- **arXiv**: 2010.11929
- **Year**: 2020
- **Key Contribution**: Pure Transformer applied to image classification
- **Impact**: Challenged CNN dominance, showed Transformers could match/exceed CNNs
- **CS231n Topics**: Transformer architectures, patch embeddings

---

## 2. Object Detection & Localization

### Mask R-CNN (2017)
- **Authors**: He et al.
- **arXiv**: 1703.06870
- **Year**: 2017
- **Key Contribution**: Extended Faster R-CNN for instance segmentation
- **Impact**: Unified detection and segmentation, became foundation for many tasks
- **CS231n Topics**: R-CNN family, instance segmentation, Region of Interest processing

### Focal Loss for Dense Object Detection (RetinaNet) (2017)
- **Authors**: Lin et al.
- **arXiv**: 1708.02002
- **Year**: 2017
- **Key Contribution**: Focal loss to address class imbalance in one-stage detectors
- **Impact**: One-stage detectors achieved two-stage accuracy
- **CS231n Topics**: One-stage detectors, loss function design, Feature Pyramid Networks

### YOLOv3: An Incremental Improvement (2018)
- **Authors**: Redmon & Farhadi
- **arXiv**: 1804.02767
- **Year**: 2018
- **Key Contribution**: Multi-scale predictions using feature pyramid
- **Impact**: Real-time performance with competitive accuracy
- **CS231n Topics**: YOLO family, real-time detection, multi-scale prediction

### DETR: End-to-End Object Detection with Transformers (2020)
- **Authors**: Carion et al.
- **arXiv**: 2005.12872
- **Year**: 2020
- **Key Contribution**: First successful Transformer-based object detector
- **Impact**: Eliminated NMS and anchor generation, simplified detection pipeline
- **CS231n Topics**: Transformer-based detection, set prediction, direct detection

---

## 3. Semantic Segmentation & Scene Understanding

### DeepLabv3+: Encoder-Decoder with Atrous Separable Convolution (2018)
- **Authors**: Chen et al.
- **arXiv**: 1802.02611
- **Year**: 2018
- **Key Contribution**: Combined encoder-decoder with atrous convolution
- **Impact**: Sharp object boundaries in semantic segmentation
- **CS231n Topics**: Atrous/dilated convolutions, encoder-decoder architectures, DeepLab family

### Segment Anything (SAM) (2023)
- **Authors**: Kirillov et al.
- **arXiv**: 2304.02643
- **Year**: 2023
- **Key Contribution**: Foundation model for promptable segmentation
- **Impact**: Zero-shot generalization, democratized segmentation
- **CS231n Topics**: Foundation models, promptable segmentation, panoptic segmentation

### Scaling Tumor Segmentation: Real and Synthetic Data (2024)
- **Authors**: Chen et al.
- **arXiv**: 2510.14831
- **Year**: 2024
- **Key Contribution**: Synthetic data effectiveness for medical segmentation
- **Impact**: Showed AI performance saturation with real data, synthetic data scaling
- **CS231n Topics**: Medical image segmentation, data efficiency, synthetic data

---

## 4. Generative Models for Vision

### DALL-E 2: Text-Conditional Image Generation with CLIP Latents (2022)
- **Authors**: Ramesh et al.
- **arXiv**: 2204.06125
- **Year**: 2022
- **Key Contribution**: High-quality text-to-image generation with diffusion models
- **Impact**: Demonstrated creative AI capabilities, commercial applications
- **CS231n Topics**: Diffusion models, text-to-image synthesis, CLIP integration

### Imagen: Photorealistic Text-to-Image Diffusion Models (2022)
- **Authors**: Saharia et al.
- **arXiv**: 2205.11487
- **Year**: 2022
- **Key Contribution**: Large language models for text encoding in image generation
- **Impact**: State-of-the-art photorealism in generated images
- **CS231n Topics**: Diffusion models, language-conditioned generation

### CM3leon: Scaling Autoregressive Multi-Modal Models (2023)
- **Authors**: Yu et al.
- **arXiv**: 2309.02591
- **Year**: 2023
- **Key Contribution**: Efficient multi-modal generation (text-to-image and image-to-text)
- **Impact**: Demonstrated autoregressive approach to multi-modal generation
- **CS231n Topics**: Autoregressive models, multi-modal generation

### DEXTER: Diffusion-Guided Explanations (2024)
- **Authors**: Carnemolla et al.
- **arXiv**: 2510.14741
- **Year**: 2024
- **Key Contribution**: Explainable AI using diffusion models for visual classifiers
- **Impact**: Combined generation with interpretability
- **CS231n Topics**: Diffusion models, explainable AI, visual explanation

---

## 5. Video Understanding & Temporal Modeling

### Eyes Wide Open: Ego Proactive Video-LLM (2025)
- **Authors**: Zhang et al.
- **arXiv**: 2510.14560
- **Year**: 2025
- **Key Contribution**: Proactive AI for real-time streaming video
- **Impact**: Anticipatory responses to unfolding events
- **CS231n Topics**: Video understanding, temporal reasoning, ego-centric vision

---

## 6. Vision-Language Models & Multimodal Learning

### Attention Is All You Need (2017)
- **Authors**: Vaswani et al.
- **arXiv**: 1706.03762
- **Year**: 2017
- **Key Contribution**: Transformer architecture with self-attention
- **Impact**: Foundation for multi-modal vision-language models
- **CS231n Topics**: Attention mechanisms, Transformer architecture, cross-modal learning

### BERT: Pre-training of Deep Bidirectional Transformers (2018)
- **Authors**: Devlin et al.
- **arXiv**: 1810.04805
- **Year**: 2018
- **Key Contribution**: Masked pre-training for language understanding
- **Impact**: Inspired vision pre-training methods and multi-modal models
- **CS231n Topics**: Pre-training strategies, masked modeling, transfer learning

### CLIP: Learning Transferable Visual Models From Natural Language (2021)
- **Authors**: Radford et al.
- **arXiv**: 2103.00020
- **Year**: 2021
- **Key Contribution**: Vision-language pre-training on web-scale data
- **Impact**: Zero-shot transfer, foundation for multi-modal AI
- **CS231n Topics**: Vision-language models, contrastive learning, zero-shot learning

---

## 7. Self-Supervised & Transfer Learning

### MoCo: Momentum Contrast for Unsupervised Learning (2019)
- **Authors**: He et al.
- **arXiv**: 1911.05722
- **Year**: 2019
- **Key Contribution**: Contrastive learning with momentum encoder
- **Impact**: Unsupervised pre-training rivaling supervised learning
- **CS231n Topics**: Contrastive learning, self-supervised learning, momentum methods

### BYOL: Bootstrap Your Own Latent (2020)
- **Authors**: Grill et al.
- **arXiv**: 2006.07733
- **Year**: 2020
- **Key Contribution**: Self-supervised learning without negative pairs
- **Impact**: Simplified contrastive learning framework
- **CS231n Topics**: Self-supervised learning, non-contrastive methods

### MAE: Masked Autoencoders Are Scalable Vision Learners (2021)
- **Authors**: He et al.
- **arXiv**: 2111.06377
- **Year**: 2021
- **Key Contribution**: Applied masked modeling to vision (BERT for images)
- **Impact**: Simple and effective self-supervised learning
- **CS231n Topics**: Masked image modeling, self-supervised learning, autoencoders

### DINOv2: Learning Robust Visual Features without Supervision (2023)
- **Authors**: Oquab et al.
- **arXiv**: 2304.07193
- **Year**: 2023
- **Key Contribution**: Self-supervised learning at scale, strong features without fine-tuning
- **Impact**: Practical foundation model for various downstream tasks
- **CS231n Topics**: Self-supervised learning, foundation models, feature learning

---

## 8. 3D Vision & Depth Estimation

_Note: Major papers in this category are from earlier work (PointNet, NeRF, etc.) not covered in 2017-2025 summary. This remains an active area with ongoing research._

### Related Work:
- PointNet (2017) - earlier foundational work
- NeRF (2020) - Neural Radiance Fields for 3D reconstruction
- Structure from Motion techniques
- Depth estimation from single images

---

## 9. Attention Mechanisms & Transformers for Vision

### Attention Is All You Need (2017)
- **Authors**: Vaswani et al.
- **arXiv**: 1706.03762
- **Year**: 2017
- **Key Contribution**: Self-attention mechanism and Transformer architecture
- **Impact**: Foundation for all subsequent Transformer-based vision models
- **CS231n Topics**: Self-attention, multi-head attention, positional encoding

### Vision Transformer (ViT) (2020)
- **Authors**: Dosovitskiy et al.
- **arXiv**: 2010.11929
- **Year**: 2020
- **Key Contribution**: Direct application of Transformers to image patches
- **Impact**: Showed Transformers could replace CNNs
- **CS231n Topics**: Pure Transformer for vision, patch embeddings, position encoding

### DETR: Detection Transformers (2020)
- **Authors**: Carion et al.
- **arXiv**: 2005.12872
- **Year**: 2020
- **Key Contribution**: Transformers for object detection with set prediction
- **Impact**: Simplified detection pipeline, eliminated hand-crafted components
- **CS231n Topics**: Transformer for detection, bipartite matching, object queries

### Swin Transformer (2021)
- **Authors**: Liu et al.
- **arXiv**: 2103.14030
- **Year**: 2021
- **Key Contribution**: Hierarchical Transformer with shifted window attention
- **Impact**: Efficient attention for high-resolution images
- **CS231n Topics**: Window attention, hierarchical features, local-global attention

---

## 10. Neural Network Optimization & Training

### EfficientNet: Model Scaling (2019)
- **Authors**: Tan & Le
- **arXiv**: 1905.11946
- **Year**: 2019
- **Key Contribution**: Compound scaling method for balanced architecture growth
- **Impact**: Systematic approach to model scaling
- **CS231n Topics**: Model scaling, architecture design, efficiency optimization

### Focal Loss (RetinaNet) (2017)
- **Authors**: Lin et al.
- **arXiv**: 1708.02002
- **Year**: 2017
- **Key Contribution**: Loss function addressing class imbalance
- **Impact**: Improved training for one-stage detectors
- **CS231n Topics**: Loss function design, class imbalance, training techniques

### MAE: Masked Autoencoders (2021)
- **Authors**: He et al.
- **arXiv**: 2111.06377
- **Year**: 2021
- **Key Contribution**: Pre-training strategy with high masking ratio
- **Impact**: Efficient pre-training for vision models
- **CS231n Topics**: Pre-training strategies, masking techniques, reconstruction loss

---

## Cross-Topic Papers (Multiple Categories)

### CLIP (2021)
- **Topics**: Vision-Language Models, Self-Supervised Learning, Transfer Learning
- **Reason**: Multi-modal pre-training, contrastive learning, zero-shot transfer

### Segment Anything (SAM) (2023)
- **Topics**: Semantic Segmentation, Transfer Learning, Attention Mechanisms
- **Reason**: Foundation model, zero-shot segmentation, Transformer-based

### DALL-E 2 (2022)
- **Topics**: Generative Models, Vision-Language Models, Attention Mechanisms
- **Reason**: Text-to-image generation, CLIP integration, diffusion Transformers

### Mask R-CNN (2017)
- **Topics**: Object Detection, Semantic Segmentation, CNN Architectures
- **Reason**: Instance segmentation, detection and segmentation unified

### Swin Transformer (2021)
- **Topics**: CNN Architectures, Attention Mechanisms, Object Detection
- **Reason**: Backbone for multiple tasks, hierarchical architecture

---

## Domain-Specific Applications by Topic

### Medical Imaging
- **Scaling Tumor Segmentation** (2024) → Semantic Segmentation, Transfer Learning
- **Multi-Tumor Early Detection** (2025) → Object Detection, Transfer Learning
- **Towards Generalist Intelligence in Dentistry** (2025) → CNN Architectures, Transfer Learning

### Wildlife & Conservation
- **Zero-Shot Wildlife Sorting** (2024) → CNN Architectures, Self-Supervised Learning, Transfer Learning

### Robotics & Embodied AI
- **Eyes Wide Open: Ego Proactive Video-LLM** (2025) → Video Understanding, Vision-Language Models

---

## Topic Coverage Analysis (2017-2025)

### Most Active Topics:
1. **Attention Mechanisms & Transformers** (7 papers)
   - Revolutionary shift from CNNs to Transformers

2. **Self-Supervised & Transfer Learning** (6 papers)
   - Evolution from supervised to foundation models

3. **Vision-Language Models** (5 papers)
   - Multi-modal learning became dominant paradigm

4. **Object Detection & Localization** (4 papers)
   - Continuous innovation from R-CNN to DETR

5. **Semantic Segmentation** (4 papers)
   - From specialized networks to foundation models

### Emerging Topics:
- **Medical AI Applications** - Increasing focus on deployment
- **Synthetic Data** - Data generation for training
- **Proactive AI** - Anticipatory systems beyond reactive models

### Underrepresented Topics in Summary:
- **3D Vision & Depth Estimation** - Active but not in top papers
- **Video Understanding** - Growing but fewer breakthrough papers

---

## Connections Between Topics

### The Transformer Pipeline:
1. **Attention Is All You Need** (2017) → Foundation
2. **ViT** (2020) → Vision application
3. **DETR** (2020) → Object detection
4. **Swin** (2021) → Hierarchical refinement
5. **SAM** (2023) → Segmentation foundation model

### The Self-Supervised Pipeline:
1. **MoCo** (2019) → Contrastive learning
2. **BYOL** (2020) → Non-contrastive learning
3. **MAE** (2021) → Masked modeling
4. **DINOv2** (2023) → Scale and deployment

### The Multi-Modal Pipeline:
1. **Attention Mechanism** (2017) → Cross-attention foundation
2. **BERT** (2018) → Language pre-training inspiration
3. **CLIP** (2021) → Vision-language alignment
4. **DALL-E 2** (2022) → Vision-language generation

### The Segmentation Pipeline:
1. **DeepLabv3+** (2018) → CNN-based segmentation
2. **Mask R-CNN** (2017) → Instance segmentation
3. **SAM** (2023) → Foundation model for segmentation
4. **Tumor Segmentation** (2024) → Domain-specific deployment

---

## Recommendations for CS231n Course Integration

### Core Papers for Each Topic:
1. **CNNs & Architectures**: EfficientNet, Swin Transformer
2. **Object Detection**: Mask R-CNN, RetinaNet, DETR
3. **Segmentation**: DeepLabv3+, SAM
4. **Generative Models**: DALL-E 2, Imagen
5. **Video Understanding**: Eyes Wide Open
6. **Vision-Language**: CLIP, DALL-E 2
7. **Self-Supervised**: MoCo, MAE, DINOv2
8. **3D Vision**: [Include PointNet, NeRF from earlier work]
9. **Attention & Transformers**: Attention Paper, ViT, DETR, Swin
10. **Optimization**: Focal Loss, EfficientNet scaling

### Suggested Reading Order:
1. Start with **Attention Is All You Need** (foundation)
2. **ResNet/EfficientNet** (CNN architectures)
3. **Mask R-CNN & RetinaNet** (detection fundamentals)
4. **ViT** (Transformer revolution)
5. **CLIP** (multi-modal learning)
6. **MAE** (self-supervised learning)
7. **DETR & Swin** (advanced Transformers)
8. **SAM** (foundation models)
9. **DALL-E 2** (generative models)
10. Recent applications (medical AI, domain-specific)
