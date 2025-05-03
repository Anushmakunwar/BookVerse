using AutoMapper;
using BookStore.DTOs.Order;

namespace BookStore.Mapping
{
    public class OrderProfile : Profile
    {
        public OrderProfile()
        {
            // Order -> OrderDTO
            CreateMap<Entities.Order, OrderDTO>()
                .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.Items));

            // OrderItem -> OrderItemDTO
            CreateMap<Entities.OrderItem, OrderItemDTO>()
                .ForMember(dest => dest.BookTitle, opt => opt.MapFrom(src => src.Book.Title))
                .ForMember(dest => dest.BookAuthor, opt => opt.MapFrom(src => src.Book.Author))
                .ForMember(dest => dest.Price, opt => opt.MapFrom(src => src.Book.Price))
                .ForMember(dest => dest.CoverImage, opt => opt.MapFrom(src => src.Book.CoverImage));
        }
    }
}
