from keras.models import load_model
from numpy import array

def predict_snowday(max_temp, min_temp, total_rain, total_snow):
    model = load_model('model.h5')
    prediction = model.predict(array([[max_temp, min_temp, total_rain, total_snow]]))[0][0]

    return prediction

print(predict_snowday(-10, -20, 0, 10))
print(predict_snowday(-10, -20, 0, 20))
print(predict_snowday(-10, -20, 0, 30))
print(predict_snowday(0, 0, 0, 0))
print(predict_snowday(0, 0, 0, 100))