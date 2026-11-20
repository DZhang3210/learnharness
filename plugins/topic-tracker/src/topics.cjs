'use strict';
// The study list, in the suggested order: foundations first, since later
// sections lean on them (eigenvectors before PCA, backprop before transformers).

const SECTIONS = [
  ['Linear Algebra', [
    'Dot product', 'Orthogonality', 'Linear independence', 'Rank / Span', 'Null space / Image space',
    'Determinant', 'Inverse of a matrix', 'Singular matrices', 'Eigenvectors / Eigenvalues',
    'Positive Semi-Definite', 'Jacobian', 'Hessian',
  ]],
  ['General ML', [
    'Expectation', 'Variance and Covariance', 'PDF / PMF', 'Bayes Theorem', 'Entropy', 'KL Divergence',
    'Jensen-Shannon Divergence', 'MLE vs MAP', 'Confidence Intervals', 'Unsupervised vs Supervised',
    'Linear Regression', 'Loss Functions', 'Convex functions', 'Gradient Descent / SGD', "Newton's Method",
    'Second Order Methods', 'Backprop', 'Activation Functions', 'Weight initialisation',
    'Adam / AdamW / Adagrad', 'BatchNorm / LayerNorm / RMSNorm', 'Bias-Variance Tradeoff',
    'Overfitting / Underfitting', 'Regularisation Methods', 'Early Stopping', 'Cross validation',
    'Precision / Recall / F1 / AUC-ROC', 'Curse of dimensionality', 'Data Whitening',
    'Dimensionality Reduction', 'Clustering Algorithms (e.g. k-means)', 'K-Nearest Neighbours', 'SVMs',
    'Decision Trees', 'Ensembles', 'Bagging', 'Boosting', 'No Free Lunch Theorem', 'CNNs',
    'RNNs / LSTMs', 'S4', 'Autoencoders', 'Gumbel-Softmax', 'Transfer Learning',
    'Few shot / Zero shot learning', 'Domain Adaptation',
  ]],
  ['LLMs', [
    'Tokenisation', 'Causal Attention', 'Cross Attention', 'Sinusoidal embeddings',
    'Relative positional embeddings', 'RoPE', 'LLM vs RNN vs S4', 'TransformerXL', 'Perceiver',
    'Griffin', 'Flash Attention', 'Mixture of Experts', 'Scaling Laws', 'LLM scaling factor',
    'Pretraining', 'Finetuning', 'LoRA', 'RLHF', 'Decoding techniques',
  ]],
  ['Reinforcement Learning', [
    'Markov Property', 'Markov Decision Process', 'Bellman Equations', 'Monte Carlo vs TD',
    'Q-Learning / TD Learning', 'SARSA', 'On-Policy vs Off-Policy', 'Exploration vs Exploitation Dilemma',
    'Credit Assignment Problem', 'Importance Sampling', 'Policy Gradient Theorem',
    'Variance Reduction in RL', 'Actor Critic', 'GAE', 'PPO', 'GRPO', 'DPO (Direct Preference Optimisation)',
    'Soft Actor-Critic', 'Model-Based vs Model-Free', 'World Models / Dreamer', 'AlphaGo', 'MuZero',
    'Curriculum Learning',
  ]],
  ['Generative Modelling', [
    'VAEs and VAE ELBO', 'GANs', 'Score Function', 'Diffusion Forward Process',
    'Diffusion Reverse Process (DDIM / DDPM)', 'Diffusion Forward / Reverse SDE', 'Flow Matching ODE',
    'Classifier Free Guidance',
  ]],
  ['Applied ML', [
    'Floating point representation', 'Numerical precision tricks', 'Mixed precision training',
    'Exploding / vanishing gradients', 'Gradient clipping', 'Gradient accumulation',
    'Gradient checkpointing', 'Communication Primitives', 'DDP', 'FSDP', 'Tensor Parallelism',
    'Pipeline Parallelism', 'Profiling', 'JIT compiling', 'JAX, PyTorch, TensorFlow',
  ]],
];

function slug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const TOPICS = SECTIONS.flatMap(([section, names]) => names.map(name => ({ id: slug(name), name, section })));

module.exports = { SECTIONS: SECTIONS.map(([name]) => name), TOPICS, slug };
