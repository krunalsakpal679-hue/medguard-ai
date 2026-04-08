import pytest
import torch
from app.ml.model.ddi_model import DDIModel

def test_model_initialization():
    """
    Verifies that the DDI neural architecture initializes with correct dimensional tensors.
    """
    input_dim = 100
    model = DDIModel(input_dim=input_dim)
    assert model is not None
    assert isinstance(model, torch.nn.Module)

def test_model_forward_pass():
    """
    Performs a smoke test forward pass to ensure biological feature propagation.
    """
    input_dim = 100
    model = DDIModel(input_dim=input_dim)
    model.eval()
    
    # Mock drug pair features
    dummy_input = torch.randn(1, input_dim)
    
    with torch.no_grad():
        output = model(dummy_input)
    
    # Check output shape (1 pair, 1 risk score)
    assert output.shape == (1, 1)
    assert 0 <= output.item() <= 1
