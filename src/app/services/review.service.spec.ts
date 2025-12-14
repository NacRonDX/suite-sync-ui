import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import {
  ReviewService,
  CreateReviewRequest,
  ReviewResponse,
} from './review.service';
import { ConfigService } from './config.service';

describe('ReviewService', () => {
  let service: ReviewService;
  let httpMock: HttpTestingController;
  let configService: ConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReviewService, ConfigService],
    });
    service = TestBed.inject(ReviewService);
    httpMock = TestBed.inject(HttpTestingController);
    configService = TestBed.inject(ConfigService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get reviews by room ID', () => {
    const mockReviews: ReviewResponse[] = [
      {
        id: 1,
        roomId: 1,
        userId: 1,
        userFirstName: 'John',
        userLastName: 'Doe',
        rating: 5,
        comment: 'Great room with excellent amenities',
        createdAt: '2023-12-14T10:00:00Z',
        updatedAt: '2023-12-14T10:00:00Z',
      },
    ];

    service.getReviewsByRoomId(1).subscribe((reviews) => {
      expect(reviews).toEqual(mockReviews);
    });

    const req = httpMock.expectOne(configService.getApiUrl('rooms/1/reviews'));
    expect(req.request.method).toBe('GET');
    req.flush(mockReviews);
  });

  it('should create a review', () => {
    const createRequest: CreateReviewRequest = {
      rating: 5,
      comment: 'Great room with excellent amenities',
    };

    const mockResponse: ReviewResponse = {
      id: 1,
      roomId: 1,
      userId: 1,
      userFirstName: 'John',
      userLastName: 'Doe',
      rating: 5,
      comment: 'Great room with excellent amenities',
      createdAt: '2023-12-14T10:00:00Z',
      updatedAt: '2023-12-14T10:00:00Z',
    };

    service.createReview(1, createRequest).subscribe((review) => {
      expect(review).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(configService.getApiUrl('rooms/1/reviews'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(createRequest);
    req.flush(mockResponse);
  });
});
