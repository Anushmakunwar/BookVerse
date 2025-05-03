using AutoMapper;
using BookStore.DTOs.Review;

namespace BookStore.Mapping
{
    public class ReviewProfile : Profile
    {
        public ReviewProfile()
        {
            // Review -> ReviewDTO
            CreateMap<Entities.Review, ReviewDTO>()
                .ForMember(dest => dest.BookTitle, opt => opt.MapFrom(src => src.Book.Title))
                .ForMember(dest => dest.MemberName, opt => opt.MapFrom(src => src.MemberProfile.User.FullName));
        }
    }
}
