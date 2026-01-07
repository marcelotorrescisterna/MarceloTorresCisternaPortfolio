from abc import ABC, abstractmethod
from typing import List, Dict

class BaseLLMProvider(ABC):
    @abstractmethod
    def generate(self, messages: List[Dict[str, str]]) -> str:
        raise NotImplementedError
