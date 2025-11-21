# Kafka Integration for Asynchronous Messaging

This document describes the Kafka integration for handling asynchronous booking processing in the Hostly application.

## Architecture Overview

The Kafka integration follows a producer-consumer pattern:

1. **Frontend Services (Producers)**: Backend API routes that receive HTTP requests and publish events to Kafka
2. **Backend Services (Consumers)**: Services that consume events from Kafka and process them asynchronously

## Kafka Topics

### 1. `booking-created`
- **Published by**: Booking creation route (`POST /api/bookings`)
- **Consumed by**: Owner service consumer
- **Purpose**: Notify owner service when a new booking request is created
- **Event Data**:
  ```json
  {
    "id": 1,
    "property_id": 1,
    "traveler_id": 1,
    "start_date": "2024-01-15",
    "end_date": "2024-01-20",
    "num_guests": 2,
    "status": "pending",
    "total_price": 500.00,
    "created_at": "2024-01-10T10:00:00Z",
    "timestamp": "2024-01-10T10:00:00Z"
  }
  ```

### 2. `booking-status-updated`
- **Published by**: Booking status update routes (`POST /api/bookings/:id/accept`, `POST /api/bookings/:id/cancel`)
- **Consumed by**: Traveler service consumer
- **Purpose**: Notify traveler service when booking status changes (accepted/cancelled)
- **Event Data**:
  ```json
  {
    "id": 1,
    "property_id": 1,
    "traveler_id": 1,
    "status": "accepted",
    "updated_at": "2024-01-10T11:00:00Z",
    "timestamp": "2024-01-10T11:00:00Z"
  }
  ```

## Flow Diagram

```
┌─────────────────┐
│  Traveler       │
│  Creates        │
│  Booking        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────┐     ┌──────────────┐
│  Backend API    │────▶│   Kafka      │────▶│  Owner       │
│  (Producer)     │     │  Topic:      │     │  Consumer    │
│                 │     │  booking-    │     │              │
│  POST /bookings │     │  created     │     │  Processes   │
└─────────────────┘     └──────────────┘     └──────────────┘
                                                    
┌─────────────────┐     ┌──────────────┐     ┌──────────────┐
│  Owner          │────▶│   Kafka      │────▶│  Traveler    │
│  Accepts/       │     │  Topic:      │     │  Consumer    │
│  Cancels        │     │  booking-    │     │              │
│  Booking        │     │  status-      │     │  Notifies    │
└─────────────────┘     │  updated     │     │  Traveler    │
                        └──────────────┘     └──────────────┘
```

## Components

### 1. Kafka Service (`backend/src/services/kafka.service.js`)
- Manages Kafka producer and consumer connections
- Provides methods to publish events
- Handles consumer initialization and message processing

### 2. Booking Consumer Service (`backend/src/services/booking-consumer.service.js`)
- Handles booking-created events (owner service)
- Handles booking-status-updated events (traveler service)
- Processes events asynchronously

### 3. Updated Routes
- `backend/src/routes/booking.routes.js`: Publishes `booking-created` events
- `backend/src/routes/owner.routes.js`: Publishes `booking-status-updated` events

## Kubernetes Setup

Kafka and Zookeeper are deployed as part of the Kubernetes cluster:

- **Zookeeper**: Manages Kafka cluster metadata
- **Kafka**: Message broker with 3 partitions per topic

### Deployment Files
- `k8s/zookeeper-deployment.yaml`: Zookeeper deployment and service
- `k8s/kafka-deployment.yaml`: Kafka deployment and service

### Configuration
- Kafka broker: `kafka:9092` (ClusterIP service)
- Zookeeper: `zookeeper:2181` (ClusterIP service)
- Auto-create topics: Enabled
- Partitions per topic: 3

## Environment Variables

Add to `k8s/configmap.yaml`:
```yaml
KAFKA_BROKER: "kafka:9092"
```

## Dependencies

Add to `backend/package.json`:
```json
"kafkajs": "^2.2.4"
```

## Usage

### Publishing Events

```javascript
const kafkaService = require('./services/kafka.service');

// Publish booking created event
await kafkaService.publishBookingCreated(bookingData);

// Publish booking status updated event
await kafkaService.publishBookingStatusUpdated(bookingData);
```

### Consuming Events

Consumers are automatically started when the backend service starts. They listen for events and process them asynchronously.

## Benefits

1. **Asynchronous Processing**: Booking operations don't block the API response
2. **Decoupled Services**: Frontend and backend services communicate via message queues
3. **Scalability**: Multiple consumers can process events in parallel
4. **Reliability**: Events are persisted and can be replayed if needed
5. **Real-time Updates**: Status changes are propagated asynchronously

## Monitoring

Check Kafka logs:
```bash
kubectl logs -n hostly -l app=kafka
```

Check consumer logs:
```bash
kubectl logs -n hostly -l app=backend | grep Kafka
```

## Future Enhancements

- Add WebSocket support for real-time traveler notifications
- Implement email notifications on booking events
- Add analytics and metrics collection
- Implement event replay for failed processing
- Add dead letter queue for failed messages

